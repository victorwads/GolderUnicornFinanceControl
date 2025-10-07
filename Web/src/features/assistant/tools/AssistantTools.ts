import type { ChatCompletionFunctionTool } from "openai/resources/index";

import { iconNamesList } from "@components/Icons";
import { Similarity } from '../utils/stringSimilarity';
import { routeMatch } from "./routesDefinition";
import type { AssistantToolDefinition } from "./types";

import { BaseRepository, RepoName, waitUntilReady, type Repositories } from "@repositories";
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
  validateRequiredFields
} from "@models";

const MAX_RESULTS = 5;
const ignoredRepos: RepoName[] = [
  'products', 'resourcesUse', 'aiCalls', 'groceries', 'user', 'creditCardsInvoices'
]

export class AssistantTools {
  private readonly baseDefinitions: AssistantToolDefinition[];
  private readonly toolMap: Map<string, AssistantToolDefinition>;
  private readonly domains: Domain<any>[] = []
  public sharedDomains: string[] = [];

  constructor(private readonly repositories: Repositories) {
    this.domains = Object.entries(this.repositories)
      .filter(([key]) => !ignoredRepos.includes(key as RepoName)) 
      .map(([name, repository]) => {
        const repoName = name as RepoName;
        return {
          name: repoName,
          handlers: []
        };
      });
    this.baseDefinitions = this.createDefinitions();

    this.toolMap = new Map([
      ...this.baseDefinitions.map((tool) => [tool.name, tool]),
      ...this.domains
        .flatMap(d => Object.values(d.handlers)
        .map(tool => [tool.name, tool]))
    ] as [string, AssistantToolDefinition][]);
  }

  buildToolSchema(): ChatCompletionFunctionTool[] {
    return [
      ...this.baseDefinitions,
      ...this.domains
        .filter(d => this.sharedDomains.includes(d.name))
        .flatMap(d => Object.values(d.handlers))
    ].map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  getDefinitions(): AssistantToolDefinition[] {
    return this.baseDefinitions;
  }

  getToolUserInfo(
    name: string,
    args: Record<string, unknown>,
    result?: unknown
  ): string | undefined {
    const tool = this.toolMap.get(name);
    return tool?.userInfo ? tool.userInfo(args, result) : undefined;
  }

  async execute(
    name: string,
    args: Record<string, unknown>,
  ): Promise<Result<unknown>> {
    const tool = this.toolMap.get(name);
    if (!tool) return { success: false, error: `Tool '${name}' not found.` }

    return tool.execute( args);
  }

  private getRepository<T extends DocumentModel>(name: RepoName): BaseRepository<T> {
    return this.repositories[name] as unknown as BaseRepository<T>;
  }

  private createFromMetadata<T extends DocumentModel>(
    {aiToolCreator, from}: ModelMetadata<T & any>,
    repoName: RepoName,
    customName?: string
  ) {
    const name = customName || repoName;
    const creator: AssistantToolDefinition =  {
      name: name + '_create',
      description: aiToolCreator.description,
      parameters: {
        type: "object",
        properties: aiToolCreator.properties,
        required: aiToolCreator.required,
        additionalProperties: false,
      },
      execute: async (args) => {
        const repository = this.getRepository<T>(repoName);
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
    const deletor: AssistantToolDefinition =  {
      name: repoName + '_delete_by_id',
      description: `Delete an existing ${aiToolCreator.name} by its identifier. Use ${DomainToolName.SEARCH_IN_DOMAIN} to obtain the ID.`,
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: `${aiToolCreator.name} identifier to delete an existing item. Use ${DomainToolName.SEARCH_IN_DOMAIN} to obtain the ID.`,
          },
        },
        required: ["id"],
        additionalProperties: false,
      },
      execute: async (args) => {
        const repository = this.getRepository<T>(repoName);
        const item = repository.getLocalById(String(args.id));
        if(!item) {
          return { success: false, error: `${aiToolCreator.name} with id '${args.id}' not found.` }
        }
        await repository.delete(String(args.id));
        return { success: true, result: "Registro excluído" }
      },
      userInfo: (_, result) => result ? `Registro excluído com sucesso` : undefined
    };
    this.registerDomainAction(name, creator);
    if (!customName) this.registerDomainAction(name, deletor);
  }

  private registerDomainAction(repoName: string, action: AssistantToolDefinition) {
    let domain = this.domains.find(d => d.name === repoName);
    if(!domain) {
      domain = { name: repoName, handlers: [] };
      this.domains.push(domain);
    }
    domain.handlers.push(action);
  }

  private createDefinitions(): AssistantToolDefinition[] {
    const domainNames = this.domains.map(d => d.name);

    const userTools: AssistantToolDefinition[] = [
      {
        name: ToUserTool.ASK,
        description: "Ask user for additional information to proceed in his native language.",
        parameters: {
          type: "object", required: ["message"],
          properties: { message: { type: "string" } },
          additionalProperties: false,
        }, execute: async () => ({ success: false }),
      },
      {
        name: ToUserTool.FINISH,
        description: "End user conversation when all requests are completed. Confirm with user before executing it.",
        parameters: {},
        execute: async () => {
          return { success: true, result: "Pedido concluído contexto resetado." };
        },
      },
    ]
    const domainTools: AssistantToolDefinition[] = [
      {
        name: DomainToolName.LIST_ALL,
        description: "List all available domains in the system.",
        parameters: {},
        execute: async () =>  ({ success: true, result: domainNames }),
      },
      {
        name: DomainToolName.LIST_ACTIONS,
        description: "List the available actions/tools for a given domain.",
        parameters: {
          type: "object",
          properties: {
            domain: { type: "string", description: "Domain name to list actions" },
          },
          required: ["domain"],
          additionalProperties: false,
        },
        execute: async ({ domain: domainName }: { domain: string }) => {
          if (!domainNames.includes(domainName)) return { success: false, error: `Domain '${domainName}' not found.` };
          const domain = this.domains.find(d => d.name === domainName);

          this.sharedDomains.push(domainName);
          return { 
            success: true, 
            result: domain?.handlers
              .map(h => ({ name: h.name, description: h.description })) ?? [] 
          };
        },
        userInfo: (args) => `Listing actions for domain '${args.domain}'`
      },
      {
        name: DomainToolName.SEARCH_IN_DOMAIN,
        description: `Search for an identifier in a given domain by term based on textual similarity. Use the returned ID to perform actions in the domain.`,
        parameters: {
          type: "object",
          properties: {
            domain: { type: "string", description: "Domain name where the search will be performed" },
            query: { type: "string", description: "Search term" },
          },
          required: ["domain", "query"],
          additionalProperties: false,
        },
        execute: async ({ domain: domainName, query, limit }: { domain: string; query: string; limit?: number }) => {
          if (!domainNames.includes(domainName)) {
            return { success: false, error: `Domain '${domainName}' not found. Use ${DomainToolName.LIST_ALL} to obtain the list of available domains.` };
          }
          const search = this.domains.find(d => d.name === domainName)?.search;
          if (!search) {
            return { success: false, error: `Domain '${domainName}' has no search capability. Inform user that this is not possible cause you can't obtain information from this domain.` };
          }

          this.sharedDomains.push(domainName);
          return search(query, limit );
        },
        userInfo: (args) => `Searching in '${args.domain}' for '${args.query}'`
      }
    ];
    this.createSearchMetadata(
      Account.metadata, "Conta", 'accounts',
      (item) => `${item.name} - ${item.type}`,
      ({ id, name, type }) => ({ id, name, type }),
      { filter: (item) => !item.archived },
    )
    this.createSearchMetadata(
      CreditCard.metadata, "Cartão de Crédito", 'creditCards',
      (item) => `${item.name} - ${item.brand}`,
      ({ id, name, brand }) => ({ id, name, brand }),
      { filter: (item) => !item.archived },
    )
    this.createSearchMetadata(
      Category.metadata, "Categoria", 'categories',
      ({name, parentId}) => {
        return parentId ? `${this.repositories.categories.getLocalById(parentId)?.name ?? "??"} -> ${name}` : name;
      },
      ({ id, name, parentId }) => ({ id, name, isSubcategory: !!parentId }),
    )
    this.createSearchMetadata(
      Bank.metadata, "Banco", 'banks',
      (item) => item.name,
      ({ id, name }) => ({ id, name }),
    )
    this.createFromMetadata(Category.metadata, 'categories')
    this.createFromMetadata(Account.metadata, 'accounts')
    this.createFromMetadata(AccountsRegistry.metadata, 'accountTransactions', `accountTransfers`)
    this.createFromMetadata(TransferRegistry.metadata2, 'accountTransactions')
    this.createFromMetadata(RecurrentRegistry.metadata2, 'recurrentTransactions')
    this.createFromMetadata(CreditCard.metadata, 'creditCards')
    this.createFromMetadata(CreditCardRegistry.metadata, 'creditCardsTransactions')
    this.registerDomainAction('categories',       {
      name: AppActionTool.LIST_ICONS,
      description: `Search for font awesome icons by term based on textual similarity.`,
      parameters: this.createSearchParamsSchemema(),
      execute: async ({ query, limit = MAX_RESULTS }: { query: string; limit?: number; }) => {
        return {
          success: true,
          result: new Similarity<string>(n => n)
            .rank(query, iconNamesList, this.capLimit(limit))
            .map(rank => rank.item),
        };
      },
      userInfo: (args) => `Procurando Ícone '${args.query}'`
    });
    return [
      ...userTools,
      ...domainTools,
      {
        name: AppActionTool.NAVIGATE,
        description: `Use when the user wants to "go to" or "see some existing information". Use ${AppActionTool.LIST_SCREENS} to obtain the routes.`,
        parameters: {
          type: "object",
          properties: {
            route: { type: "string", description: "Term to search a screen. use words related to the screen in english" },
            queryParams: { 
              type: "object",
              description: "optional query parameters for the screen",
              additionalProperties: true,
            }
          }
        },
        execute: async ({ route, queryParams }): Promise<Result<void>> => {
          if(!route) return { success: false, error: `route is required. use ${AppActionTool.LIST_SCREENS} to obtain the list of available screens.` };
          const routes = (await import("./routesDefinition")).routesDefinition;
          const match = routes.find(r => routeMatch(r.name, route));
          if(!match) {
            return { success: false, error: `Route '${route}' not found. use ${AppActionTool.LIST_SCREENS} to obtain the list of available screens.` };
          }

          const requiredParams = Object.entries(match.queryParams ?? {}).filter(([_, param]) => param.required).map(([key, _]) => key);
          const missingParams = requiredParams.filter(param => !queryParams || !(param in queryParams));
          if(missingParams.length) {
            return { success: false, error: `Parâmetros obrigatórios faltando: ${missingParams.join(", ")}.` };
          }
          return { success: true, result: route };
        }
      },
      {
        name: AppActionTool.LIST_SCREENS,
        description: "List the available routes and their parameters when user wants to navigate or see existing information.",
        parameters: this.createSearchParamsSchemema(),
        execute: async ({ query }) => {
          const routes = (await import("./routesDefinition")).stringRoutesDefinition;
          const similarity = new Similarity<string>(route => route);
          return {
            success: true,
            result: similarity.rank(query, routes, 5)
          }
        },
        userInfo: (args) => `Procurando telas sobre '${args.query}'`
      },
    ]
  }

  private createSearchMetadata<M extends DocumentModel>(
    metadata: ModelMetadata<M>, itemName: string, repositoryName: RepoName,
    selector: (item: M) => string, mapper: (item: M) => object,
    params?: {
      filter?: (item: M) => boolean
      repos?: RepoName[]
    }
  ) {
    const domain = this.domains.find(d => d.name === repositoryName);
    if (!domain) throw new Error(`Domain '${repositoryName}' not found to create search metadata.`);

    const repository = this.repositories[repositoryName] as unknown as BaseRepository<M>;
    const { filter = () => true, repos = [] } = params ?? {};

    domain.search = async (query: string, limit?: number) => {
      await repository.waitUntilReady();
      await waitUntilReady(...repos);

      const items = repository.getCache().filter(filter);
      const similarity = new Similarity<M>(selector);

      return {
        success: true,
        result: similarity
          .rank(query, items, this.capLimit(limit))
          .map(rank => mapper(rank.item)),
      };
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

export enum ToUserTool {
  FINISH = "finish_conversation",
  ASK = "ask_user_aditional_info",
};
export enum DomainToolName {
  LIST_ALL = "list_domains",
  LIST_ACTIONS = "list_domain_actions",
  SEARCH_IN_DOMAIN = "search_id_in_domain",
}
export enum AppActionTool {
  LIST_ICONS = "search_icon_by_name",
  LIST_SCREENS = "search_navigation_options",
  NAVIGATE = "navigate_to_screen",
}

export type DomainAction<T = string> = T;
export type Domain<Name extends RepoName> = {
  name: Name;
  search?: (term: string, limit?: number) => Promise<Result<unknown[]>>;
  handlers: AssistantToolDefinition[];
}
