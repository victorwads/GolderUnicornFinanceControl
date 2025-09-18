import { resolveDateInput } from './utils/dateHelpers';
import type {
  AssistantToolDefinition,
  AssistantToolName,
  AskUserPayload,
} from './types';

const MAX_RESULTS = 5;

const AVAILABLE_ACTIONS = [
  'transfer',
  'account_entry',
  'creditcard_entry',
  'search_accounts',
  'search_credit_cards',
  'search_categories',
] as const;

const toolDefinitions: AssistantToolDefinition[] = [
  {
    name: 'list_available_actions',
    description: 'Retorna a lista de ações que o assistente consegue executar.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    execute: () => ({ actions: [...AVAILABLE_ACTIONS] }),
  },
  {
    name: 'search_accounts',
    description: 'Busca contas bancárias pelo termo informado.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Termo de busca (nome, banco, apelido etc.)',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: MAX_RESULTS,
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
    execute: ({ query, limit = MAX_RESULTS }: { query: string; limit?: number }) => {
      const capped = Math.min(MAX_RESULTS, Math.max(1, Math.round(limit)) || MAX_RESULTS);
      // TODO: Integrar com o repositório real de contas
      const mock = [
        { id: 'acc_mock_main', name: 'Conta Corrente Principal', extra: 'Banco Inter' },
        { id: 'acc_mock_savings', name: 'Poupança Família', extra: 'Caixa Econômica' },
        { id: 'acc_mock_nu', name: 'NuConta Victor', extra: 'Nubank' },
      ];
      return mock
        .filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.extra?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, capped);
    },
  },
  {
    name: 'search_credit_cards',
    description: 'Busca cartões de crédito pelo termo informado.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Termo de busca (banco, final do cartão, apelido etc.)',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: MAX_RESULTS,
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
    execute: ({ query, limit = MAX_RESULTS }: { query: string; limit?: number }) => {
      const capped = Math.min(MAX_RESULTS, Math.max(1, Math.round(limit)) || MAX_RESULTS);
      // TODO: Integrar com o repositório real de cartões de crédito
      const mock = [
        { id: 'card_mock_nu', name: 'Nubank Platinum', extra: 'final 1234' },
        { id: 'card_mock_bradesco', name: 'Bradesco Visa', extra: 'final 9876' },
        { id: 'card_mock_santander', name: 'Santander Mastercard', extra: 'final 4567' },
      ];
      return mock
        .filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.extra?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, capped);
    },
  },
  {
    name: 'search_categories',
    description: 'Sugere categorias com base em similaridade textual.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Termo para buscar categorias.',
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: MAX_RESULTS,
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
    execute: ({ query, limit = MAX_RESULTS }: { query: string; limit?: number }) => {
      const capped = Math.min(MAX_RESULTS, Math.max(1, Math.round(limit)) || MAX_RESULTS);
      // TODO: Integrar com dados reais utilizando o util de similaridade
      const mock = [
        { id: 'cat_mock_food', name: 'Alimentação' },
        { id: 'cat_mock_transport', name: 'Transporte' },
        { id: 'cat_mock_entertainment', name: 'Lazer' },
        { id: 'cat_mock_bills', name: 'Contas Fixas' },
      ];
      return mock
        .filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, capped);
    },
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
    execute: (args: {
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
    },
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
    execute: (args: {
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
    },
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
    execute: (args: {
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
    },
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
    execute: (args: AskUserPayload) => ({ acknowledged: true, ...args }),
  },
];

const toolMap = new Map<AssistantToolName, AssistantToolDefinition>();
for (const tool of toolDefinitions) {
  toolMap.set(tool.name, tool);
}

export function getToolDefinitions(): AssistantToolDefinition[] {
  return toolDefinitions;
}

export async function executeTool(
  name: AssistantToolName,
  args: Record<string, unknown>
): Promise<unknown> {
  const tool = toolMap.get(name);
  if (!tool) {
    throw new Error(`Tool '${name}' não reconhecida.`);
  }
  return tool.execute(args);
}
