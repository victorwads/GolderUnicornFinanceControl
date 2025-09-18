import { resolveDateInput } from './utils/dateHelpers';
import type {
  AssistantToolDefinition,
  AssistantToolName,
  AskUserPayload,
} from './types';
import { Repositories, waitUntilReady } from '@repositories';
import { Similarity } from './utils/stringSimilarity';
import { Account, Category, CreditCard } from '@models';
import { ChatCompletionFunctionTool } from 'openai/resources/index';

const MAX_RESULTS = 5;

const AVAILABLE_ACTIONS = [
  'transfer',
  'account_entry',
  'creditcard_entry',
  'search_accounts',
  'search_credit_cards',
  'search_categories',
] as const;

export class AssistantTools {
  private readonly definitions: AssistantToolDefinition[];
  private readonly toolMap: Map<AssistantToolName, AssistantToolDefinition>;

  constructor(
    private readonly repositories: Repositories
  ) {
    this.definitions = this.createDefinitions();
    this.toolMap = new Map(
      this.definitions.map((tool) => 
        [tool.name as AssistantToolName, tool]
      )
    );
  }

  public buildToolSchema(): ChatCompletionFunctionTool[] {
    return this.definitions.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  public async execute(
    name: AssistantToolName,
    args: Record<string, unknown>[]
  ): Promise<unknown> {
    const tool = this.toolMap.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' não reconhecida.`);
    }
    return tool.execute(args);
  }

  private createDefinitions(): AssistantToolDefinition[] {
    return [
      {
        name: 'list_available_actions',
        description: 'Retorna a lista de ações que o assistente consegue executar.',
        parameters: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        execute: this.listAvailableActions,
      },
      {
        name: 'search_accounts',
        description: 'Busca possíveis contas bancárias pelo termo informado.',
        parameters: this.createSearchParamsSchemema('Termo de busca (nome, banco, apelido etc.)'),
        execute: this.searchAccounts,
      },
      {
        name: 'search_credit_cards',
        description: 'Busca possíveis cartões de crédito pelo termo informado.',
        parameters: this.createSearchParamsSchemema('Termo de busca (banco, final do cartão, apelido etc.)'),
        execute: this.searchCreditCards,
      },
      {
        name: 'search_categories',
        description: 'Sugere possíveis categorias com base em similaridade textual.',
        parameters: this.createSearchParamsSchemema('Termo para buscar categorias.'),
        execute: this.searchCategories,
      },
      {
        name: 'create_transfer',
        description: 'Cria uma pré-ação de transferência entre contas.',
        parameters: {
          type: 'object',
          properties: {
            from_account_id: { type: 'string' },
            to_account_id: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string', default: 'BRL' },
            date: { type: 'string', description: 'Data da transferência (YYYY-MM-DD).' },
            category_id: { type: 'string' },
            note: { type: 'string' },
          },
          required: ['from_account_id', 'to_account_id', 'amount'],
          additionalProperties: false,
        },
        execute: this.createTransfer,
      },
      {
        name: 'create_account_entry',
        description: 'Cria uma pré-ação de lançamento em conta.',
        parameters: {
          type: 'object',
          properties: {
            account_id: { type: 'string' },
            entry_type: { type: 'string', enum: ['debit', 'credit'] },
            amount: { type: 'number' },
            currency: { type: 'string', default: 'BRL' },
            date: { type: 'string' },
            category_id: { type: 'string' },
            note: { type: 'string' },
          },
          required: ['account_id', 'entry_type', 'amount'],
          additionalProperties: false,
        },
        execute: this.createAccountEntry,
      },
      {
        name: 'create_creditcard_entry',
        description: 'Cria uma pré-ação de lançamento em cartão de crédito.',
        parameters: {
          type: 'object',
          properties: {
            card_id: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string', default: 'BRL' },
            date: { type: 'string' },
            category_id: { type: 'string' },
            note: { type: 'string' },
          },
          required: ['card_id', 'amount'],
          additionalProperties: false,
        },
        execute: this.createCreditCardEntry,
      },
      {
        name: 'ask_user',
        description: 'Solicita informações adicionais ao usuário para prosseguir.',
        parameters: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            options: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  label: { type: 'string' },
                },
                required: ['id', 'label'],
                additionalProperties: false,
              },
            },
          },
          required: ['message'],
          additionalProperties: false,
        },
        execute: this.askUser,
      },
    ];
  }

  private listAvailableActions = () => ({ actions: [...AVAILABLE_ACTIONS] });

  private searchAccounts = async ({ query, limit = MAX_RESULTS }: { query: string; limit?: number }) => {
    await waitUntilReady('accounts', 'banks');
    const similarity = new Similarity<Account>((item) => `${item.name} - ${item.type}`);
    const accounts = this.repositories.accounts.getCache().filter((acc) => !acc.archived);
    
    return { 
      result: similarity.rank(query, accounts, this.capLimit(limit))
        .map(({item: {id, name, type}}) => ({id, name, type}))
    };
  };

  private searchCreditCards = async ({ query, limit = MAX_RESULTS }: { query: string; limit?: number }) => {
    await waitUntilReady('creditCards', 'accounts', 'banks');

    const similarity = new Similarity<CreditCard>((card) => `${card.name} - ${card.brand ?? ''}`);
    const cards = this.repositories.creditCards
      .getCache()
      .filter((card) => !card.archived);

    return {
      result: similarity.rank(query, cards, this.capLimit(limit))
        .map(({ item: { id, name, brand } }) => ({ id, name, brand })),
    };
  };

  private searchCategories = async ({ query, limit = MAX_RESULTS }: { query: string; limit?: number }) => {
    await waitUntilReady('categories');

    const categories = this.repositories.categories.getCache();
    const similarity = new Similarity<Category>((category) => `${category.name}`);

    return {
      result: similarity.rank(query, categories, this.capLimit(limit))
        .map(({ item: { id, name, parentId } }) => ({ id, name, isSubcategory: !!parentId })),
    };
  };

  private createTransfer = async (args: {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    currency?: string;
    date?: string;
    category_id?: string;
    note?: string;
  }) => {
    const payload = {
      ...args,
      currency: args.currency || 'BRL',
      date: resolveDateInput(args.date),
    };
    console.log('create_transfer', payload);
    return { acknowledged: true, preview: payload };
  };

  private createAccountEntry = async (args: {
    account_id: string;
    entry_type: 'debit' | 'credit';
    amount: number;
    currency?: string;
    date?: string;
    category_id?: string;
    note?: string;
  }) => {
    const payload = {
      ...args,
      currency: args.currency || 'BRL',
      date: resolveDateInput(args.date),
    };
    console.log('create_account_entry', payload);
    return { acknowledged: true, preview: payload };
  };

  private createCreditCardEntry = async (args: {
    card_id: string;
    amount: number;
    currency?: string;
    date?: string;
    category_id?: string;
    note?: string;
  }) => {
    const payload = {
      ...args,
      currency: args.currency || 'BRL',
      date: resolveDateInput(args.date),
    };
    console.log('create_creditcard_entry', payload);
    return { acknowledged: true, preview: payload };
  };

  private createSearchParamsSchemema(description: string) {
    return {
      type: 'object',
      properties: {
        query: { type: 'string', description },
      },
      required: ['query'],
      additionalProperties: false,
    };
  }

  private askUser = async (args: AskUserPayload) => ({ acknowledged: true, ...args });

  private capLimit(limit?: number) {
    return Math.min(MAX_RESULTS, Math.max(1, Math.round(limit ?? MAX_RESULTS)));
  }
}
