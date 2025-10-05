import type { ChatCompletionFunctionTool } from "openai/resources/index";

import { Similarity, RankedResult } from '../utils/stringSimilarity';
import type {
  AssistantToolDefinition,
  AssistantToolName,
} from "./types";
import { RepoName, waitUntilReady, type Repositories } from "@repositories";
import {
  Account,
  CreditCard,
  TransferRegistry,
  AccountsRegistry,
  CreditCardRegistry,
  ModelMetadata,
  Result,
  DocumentModel,
  Category,
  Bank,
  AccountRecurrentRegistry as RecurrentRegistry,
} from "@models";
import { validateRequiredFields } from "@models";
import { routeMatch, type RoutesDefinition } from "./routesDefinition";
import BaseRepository from "src/data/repositories/RepositoryBase";
import { iconNamesList } from "@components/Icons";

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
    {aiToolCreator, from}: ModelMetadata<T>,
    repository: BaseRepository<any>
  ): AssistantToolDefinition<Result<T>> {
    return {
      name: 'action_create_' + aiToolCreator.name,
      description: aiToolCreator.description,
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: `ID to manipulate an existing item. Use search_${aiToolCreator.name} to obtain the ID.`,
          },
          remove: {
            type: "boolean",
            description: "used to delete the item with the given ID",
          },
          ...Object.entries(aiToolCreator.properties).reduce((acc: object, [key, prop]: [string, { [K in R]?: Properties }]) => {
            acc[key] = {
              ...prop,
              description: prop.description + `only if informed by the user ou tool.`,
            }
            return acc;
          }, {} as object),
        },
        required: aiToolCreator.required,
        additionalProperties: false,
      },
      execute: async (args) => {
        if (args.remove && args.id) {
          await repository.delete(String(args.id));
          return { success: true, result: "Registro excluído" }
        }

        const validatedFields = validateRequiredFields(args, aiToolCreator.required);
        if (!validatedFields.success) {
          return validatedFields
        }

        const result = from(args, this.repositories);
        if (!result.success) return result

        const updates = Array.isArray(result.result) ? result.result : [result.result];
        updates.forEach(item => {
          repository.set(item, true)
          console.log("Saved item from repo" + repository.constructor.name, item)
        });

        return result
      },
      userInfo: (_, result) => result ? 
        typeof result === "string" ? result :
        `(Beta) Criado ${aiToolCreator.name}\n${Object
          .entries(result)
          .map(([key, value]) => 
            `- ${key}: ${JSON.stringify(value, null, 2)}`
          ).join("\n")
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
        name: 'action_navigate_to_screen',
        description: 'Utilizar quando o usuário quer "ir para" ou "ver alguma informação". Sempre use search_navigation_options antes para obter a listagem de telas e seus parâmetros.',
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
          const match = routes.find(r => routeMatch(r.name, route));
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
        description: "Lista telas e visualizações disponíveis e seus parâmetros para navegação.",
        parameters: this.createSearchParamsSchemema(),
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
      {
        name: `search_icon_name`,
        description: `Search for font awesome icons by term based on textual similarity.`,
        parameters: this.createSearchParamsSchemema(),
        execute: async ({ query, limit = MAX_RESULTS }: { query: string; limit?: number; }) => {
          return {
            result: new Similarity<string>(n => n)
              .rank(query, iconNamesList, this.capLimit(limit))
              .map(rank => rank.item),
          };
        },
        userInfo: (args) => `Procurando Ícone '${args.query}'`
      },
      this.createSearchMetadata(
        Account.metadata, "Conta", this.repositories.accounts,
        (item) => `${item.name} - ${item.type}`,
        ({ id, name, type }) => ({ id, name, type }),
        { filter: (item) => !item.archived },
      ),
      this.createSearchMetadata(
        CreditCard.metadata, "Cartão de Crédito", this.repositories.creditCards,
        (item) => `${item.name} - ${item.brand}`,
        ({ id, name, brand }) => ({ id, name, brand }),
        { filter: (item) => !item.archived },
      ),
      this.createSearchMetadata(
        Category.metadata, "Categoria", this.repositories.categories,
        ({name, parentId}) => {
          return parentId ? `${this.repositories.categories.getLocalById(parentId)?.name ?? "??"} -> ${name}` : name;
        },
        ({ id, name, parentId }) => ({ id, name, isSubcategory: !!parentId }),
      ),
      this.createSearchMetadata(
        Bank.metadata, "Banco", this.repositories.banks,
        (item) => item.name,
        ({ id, name }) => ({ id, name }),
      ),
      this.createFromMetadata(Category.metadata, this.repositories.categories),
      this.createFromMetadata(Account.metadata, this.repositories.accounts),
      this.createFromMetadata(AccountsRegistry.metadata, this.repositories.accountRegistries),
      this.createFromMetadata(TransferRegistry.metadata2, this.repositories.accountRegistries),
      this.createFromMetadata(RecurrentRegistry.metadata2, this.repositories.recurrentRegistries),
      this.createFromMetadata(CreditCard.metadata, this.repositories.creditCards),
      this.createFromMetadata(CreditCardRegistry.metadata, this.repositories.creditCardsRegistries),
    ];
  }

  private createSearchMetadata<M extends DocumentModel>(
    metadata: ModelMetadata<M>, itemName: string, repository: BaseRepository<M>,
    selector: (item: M) => string, mapper: (item: M) => object,
    params?: {
      filter?: (item: M) => boolean
      repos?: RepoName[]
    }
  ): AssistantToolDefinition<unknown> {
    const { filter = () => true, repos = [] } = params ?? {};
    return {
      name: `search_${metadata.aiToolCreator.name}`,
      description: `Search for ${itemName}s by term based on textual similarity.`,
      parameters: this.createSearchParamsSchemema(),
      execute: async ({ query, limit = MAX_RESULTS }: { query: string; limit?: number; }) => {
        await repository.waitUntilReady();
        await waitUntilReady(...repos);

        const items = repository.getCache().filter(filter);

        const similarity = new Similarity<M>(selector);

        return {
          result: similarity
            .rank(query, items, this.capLimit(limit))
            .map(rank => mapper(rank.item)),
        };
      },
      userInfo: (args) => `Procurando ${itemName} '${args.query}'`
    }
  }

  private createSearchParamsSchemema(userInfoDescription?: string) {
    return {
      type: "object",
      properties: {
        query: { type: "string", description: "Termo de busca nome ou características" },
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
