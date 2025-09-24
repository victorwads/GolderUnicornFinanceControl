import type { ChatCompletionFunctionTool } from "openai/resources/index";

import { Similarity } from "../utils/stringSimilarity";
import type {
  AssistantToolDefinition,
  AssistantToolName,
} from "./types";
import { waitUntilReady, type Repositories } from "@repositories";
import {
  Account,
  CreditCard,
  TransferRegistry,
  AccountsRegistry,
  CreditCardRegistry,
  ModelMetadata,
  Result,
} from "@models";
import { validateRequiredFields } from "@models";
import type { RoutesDefinition } from "./routesDefinition";

const MAX_RESULTS = 10;

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

  getToolUserInfo(
    name: AssistantToolName,
    args: Record<string, unknown>,
    result?: unknown
  ): string | undefined {
    const tool = this.toolMap.get(name);
    return tool?.userInfo ? tool.userInfo(args, result) : undefined;
  }

  async execute(
    name: AssistantToolName,
    args: Record<string, unknown>,
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
      name: 'action_create_' + aiToolCreator.name,
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
      userInfo: (_, result) => result ? `(Beta) Criado ${aiToolCreator.name}\n${
        Object.entries(result).map(([key, value]) => `- ${key}: ${JSON.stringify(value, null, 2)}`).join("\n")
      }` : undefined
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
        userInfo: (args) => `Procurando ações disponíveis.`
      },
      {
        name: "search_accounts",
        description: "Busca possíveis contas bancárias pelo termo informado.",
        parameters: this.createSearchParamsSchemema(
          "Termo de busca (nome, banco, apelido etc.)"
        ),
        execute: this.searchAccounts,
        userInfo: (args) => `Procurando conta '${args.query}'`
      },
      {
        name: "search_credit_cards",
        description: "Busca possíveis cartões de crédito pelo termo informado.",
        parameters: this.createSearchParamsSchemema(
          "Termo de busca (banco, final do cartão, apelido etc.)"
        ),
        execute: this.searchCreditCards,
        userInfo: (args) => `Procurando cartão '${args.query}'`
      },
      {
        name: "search_categories",
        description:
          "Sugere possíveis categorias com base em similaridade textual.",
        parameters: this.createSearchParamsSchemema(
          "Termo para buscar categorias."
        ),
        execute: this.searchCategories,
        userInfo: (args) => `Procurando categoria '${args.query}'`
      },
      this.createFromMetadata(TransferRegistry.metadataTransfer),
      this.createFromMetadata(AccountsRegistry.metadata),
      this.createFromMetadata(CreditCardRegistry.metadata),
      {
        name: 'action_navigate_to_screen',
        description: 'Navega para visualização especificada, normalment utilizada quando o usuário quer ver alguma informação. Use search_navigation_options para obter mais informações sobre as telas e seus parâmetros.',
        parameters: {
          type: "object",
          properties: {
            route: { type: "string", description: "Rota da tela para navegar já com path params se houver" },
            queryParams: { 
              type: "object",
              description: "Parâmetros opcionais descritos nas rotas",
              additionalProperties: { type: "string"
              }
            }
          }
        },
        execute: async ({ route, queryParams }): Promise<Result<void>> => {
          if(!route) return { success: false, error: "Rota é obrigatória. use search_navigation_options para obter a lista de telas disponíveis." };
          const routes = (await import("./routesDefinition")).routesDefinition;
          const match = routes.find(r => {
            let sanitizedName = route.split("?")[0];
            
            return r.name.startsWith(sanitizedName);
          });
          if(!match) {
            return { success: false, error: `Rota '${route}' não encontrada. use search_navigation_options para obter a lista de telas disponíveis.` };
          }

          const requiredParams = Object.entries(match.queryParams ?? {}).filter(([_, param]) => param.required).map(([key, _]) => key);
          const missingParams = requiredParams.filter(param => !queryParams || !(param in queryParams));
          if(missingParams.length) {
            return { success: false, error: `Parâmetros obrigatórios faltando: ${missingParams.join(", ")}.` };
          }
          return { success: true, result: undefined };
        }
      },
      {
        name: "search_navigation_options",
        description: "Lista as telas disponíveis para navegação.",
        parameters: this.createSearchParamsSchemema(
          "Termo para buscar alguma telas. sempre em inglês.",
          "O Termo porem no idioma do usuário."
        ),
        execute: async ({ query }) => {
          const routes = (await import("./routesDefinition")).stringRoutesDefinition;
          const similarity = new Similarity<string>(route => route);
          return {
            result: similarity.rank(query, routes, 5)
          }
        },
        userInfo: (args) => `Procurando telas sobre '${args.userInfo}'`
      },
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
    const repository = this.repositories.categories;

    await waitUntilReady("categories");

    const categories = repository.getCache()
      .map(({id, name, parentId}) => {
        if(parentId) {
          name = `${repository.getLocalById(parentId)?.name ?? "??"} -> ${name}`;
        } else {
          name = `${name} ->`;
        }
        return { id, name}
      })
    const similarity = new Similarity<typeof categories[number]>(
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

  private createSearchParamsSchemema(description: string, userInfoDescription?: string) {
    return {
      type: "object",
      properties: {
        query: { type: "string", description },
        ...(userInfoDescription ? { userInfo: { type: "string", description: userInfoDescription } } : {})
      },
      required: ["query", ...(userInfoDescription ? ["userInfo"] : [])],
      additionalProperties: false,
    };
  }

  private capLimit(limit?: number) {
    return Math.min(MAX_RESULTS, Math.max(1, Math.round(limit ?? MAX_RESULTS)));
  }
}
