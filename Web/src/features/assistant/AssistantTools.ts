import type { ChatCompletionFunctionTool } from "openai/resources/index";

import { Similarity } from "./utils/stringSimilarity";
import type {
  AssistantToolDefinition,
  AssistantToolName,
  AskUserPayload,
  AssistantToolExecution,
} from "./types";
import { waitUntilReady, type Repositories } from "@repositories";
import {
  Account,
  CreditCard,
  Category,
  TransferRegistry,
  AccountsRegistry,
  CreditCardRegistry,
  ModelMetadata,
  Result,
} from "@models";
import { validateRequiredFields } from "@models";

const MAX_RESULTS = 5;

export class AssistantTools {
  private readonly definitions: AssistantToolDefinition<unknown>[];
  private readonly toolMap: Map<AssistantToolName, AssistantToolDefinition<unknown>>;

  constructor(private readonly repositories: Repositories) {
    this.definitions = this.createDefinitions();
    this.toolMap = new Map(
      this.definitions.map((tool) => [tool.name as AssistantToolName, tool])
    );
  }

  buildToolSchema(): ChatCompletionFunctionTool[] {
    return this.definitions.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  getDefinitions(): AssistantToolDefinition<unknown>[] {
    return this.definitions;
  }

  async execute(
    name: AssistantToolName,
    args: Record<string, unknown>,
    metadata: { id?: string } = {}
  ): Promise<unknown> {
    const tool = this.toolMap.get(name);
    if (!tool) throw new Error(`Tool '${name}' não reconhecida.`);

    const result = await tool.execute?.(args);
    return result;
  }

  private createFromMetadata<T>(
    {aiToolCreator, from}: ModelMetadata<T>
  ): AssistantToolDefinition<Result<T>> {
    return {
      name: aiToolCreator.name,
      description: aiToolCreator.description,
      parameters: {
        type: "object",
        properties: aiToolCreator.properties,
        required: aiToolCreator.required,
        additionalProperties: false,
      },
      execute: async (args) => {
        const validatedFields = validateRequiredFields(args, aiToolCreator.required);
        if (!validatedFields.success) return validatedFields;

        return from(args)
      },
    };
  }

  private createDefinitions(): AssistantToolDefinition<unknown>[] {
    return [
      {
        name: "list_available_actions",
        description:
          "Retorna a lista de ações que o assistente consegue executar.",
        parameters: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
        execute: async () => this.definitions.map(def => def.name),
      },
      {
        name: "search_accounts",
        description: "Busca possíveis contas bancárias pelo termo informado.",
        parameters: this.createSearchParamsSchemema(
          "Termo de busca (nome, banco, apelido etc.)"
        ),
        execute: this.searchAccounts,
      },
      {
        name: "search_credit_cards",
        description: "Busca possíveis cartões de crédito pelo termo informado.",
        parameters: this.createSearchParamsSchemema(
          "Termo de busca (banco, final do cartão, apelido etc.)"
        ),
        execute: this.searchCreditCards,
      },
      {
        name: "search_categories",
        description:
          "Sugere possíveis categorias com base em similaridade textual.",
        parameters: this.createSearchParamsSchemema(
          "Termo para buscar categorias."
        ),
        execute: this.searchCategories,
      },
      this.createFromMetadata(TransferRegistry.metadataTransfer),
      this.createFromMetadata(AccountsRegistry.metadata),
      this.createFromMetadata(CreditCardRegistry.metadata),
      {
        name: "ask_aditional_info",
        description:
          "Solicita informações adicionais ao usuário para prosseguir.",
        parameters: {
          type: "object",
          properties: { message: { type: "string" } },
          required: ["message"],
          additionalProperties: false,
        },
      },
    ];
  }

  private searchAccounts = async ({
    query,
    limit = MAX_RESULTS,
  }: {
    query: string;
    limit?: number;
  }) => {
    await waitUntilReady("accounts", "banks");
    const similarity = new Similarity<Account>(
      (item) => `${item.name} - ${item.type}`
    );
    const accounts = this.repositories.accounts
      .getCache()
      .filter((acc) => !acc.archived);

    return {
      result: similarity
        .rank(query, accounts, this.capLimit(limit))
        .map(({ item: { id, name, type } }) => ({ id, name, type })),
    };
  };

  private searchCreditCards = async ({
    query,
    limit = MAX_RESULTS,
  }: {
    query: string;
    limit?: number;
  }) => {
    await waitUntilReady("creditCards", "accounts", "banks");

    const similarity = new Similarity<CreditCard>(
      (card) => `${card.name} - ${card.brand ?? ""}`
    );
    const cards = this.repositories.creditCards
      .getCache()
      .filter((card) => !card.archived);

    return {
      result: similarity
        .rank(query, cards, this.capLimit(limit))
        .map(({ item: { id, name, brand } }) => ({ id, name, brand })),
    };
  };

  private searchCategories = async ({
    query,
    limit = MAX_RESULTS,
  }: {
    query: string;
    limit?: number;
  }) => {
    await waitUntilReady("categories");

    const categories = this.repositories.categories.getCache();
    const similarity = new Similarity<Category>(
      (category) => `${category.name}`
    );

    return {
      result: similarity
        .rank(query, categories, this.capLimit(limit))
        .map(({ item: { id, name, parentId } }) => ({
          id,
          name,
          isSubcategory: !!parentId,
        })),
    };
  };

  private createSearchParamsSchemema(description: string) {
    return {
      type: "object",
      properties: {
        query: { type: "string", description },
      },
      required: ["query"],
      additionalProperties: false,
    };
  }

  private capLimit(limit?: number) {
    return Math.min(MAX_RESULTS, Math.max(1, Math.round(limit ?? MAX_RESULTS)));
  }
}
