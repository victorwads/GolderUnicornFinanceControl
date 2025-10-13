import type { ChatCompletionFunctionTool } from "openai/resources/index";

import { Similarity } from '../utils/stringSimilarity';
import type { AssistantToolDefinition } from "./types";

import { BaseRepository, RepoName, waitUntilReady, type Repositories } from "@repositories";
import {
  ModelMetadata,
  Result,
  DocumentModel,
  validateRequiredFields
} from "@models";

export const MAX_RESULTS = 5;
const ignoredRepos: RepoName[] = [
  'products', 'resourcesUse', 'aiCalls', 'groceries', 'user', 'creditCardsInvoices'
]

export abstract class AssistantToolsBase {
  protected readonly baseDefinitions: AssistantToolDefinition[];
  protected readonly toolMap: Map<string, AssistantToolDefinition>;
  protected readonly domains: Domain<any>[] = []
  public sharedDomains: string[] = [];

  constructor(protected readonly repositories: Repositories) {
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
    if (!tool) return { success: false, errors: `Tool '${name}' not found.` }

    return tool.execute( args);
  }

  protected getRepository<T extends DocumentModel>(name: RepoName): BaseRepository<T> {
    return this.repositories[name] as unknown as BaseRepository<T>;
  }

  protected createFromMetadata<T extends DocumentModel>(
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
        `(Beta) Criado ${name}\n${Object
          .entries(result)
          .map(([key, value]) => 
            `- ${key}: ${JSON.stringify(value, null, 2)}`
          ).join("\n")
        }` : undefined
    };
    const deletor: AssistantToolDefinition =  {
      name: repoName + '_delete_by_id',
      description: `Delete an existing ${name} by its identifier. Use ${DomainToolName.SEARCH_IN_DOMAIN} to obtain the ID.`,
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: `${name} identifier to delete an existing item. Use ${DomainToolName.SEARCH_IN_DOMAIN} to obtain the ID.`,
          },
        },
        required: ["id"],
        additionalProperties: false,
      },
      execute: async (args) => {
        const repository = this.getRepository<T>(repoName);
        const item = repository.getLocalById(String(args.id));
        if(!item) {
          return { success: false, errors: `${name} with id '${args.id}' not found.` }
        }
        await repository.delete(String(args.id));
        return { success: true, result: "Registro excluído" }
      },
      userInfo: (_, result) => result ? `Registro excluído com sucesso` : undefined
    };

    const updator: AssistantToolDefinition =  {
      name: name + '_update',
      description: `Update an existing ${name}. You must provide the 'id' field to identify the record. Use ${DomainToolName.SEARCH_IN_DOMAIN} to obtain the ID.`,
      parameters: {
        type: "object",
        properties: {
          ...aiToolCreator.properties,
          id: {
            type: "string",
            description: `${name} identifier to update an existing item. Use ${DomainToolName.SEARCH_IN_DOMAIN} to obtain the ID.`,
          },
        },
        required: ["id"],
        additionalProperties: false,
      },
      execute: async (args) => {
        const repository = this.getRepository<T>(repoName);
        if (!args.id) return { 
          success: false, errors: `Field 'id' is required to update a ${name}. Use ${DomainToolName.SEARCH_IN_DOMAIN} to obtain the ID.`
        }

        const item = repository.getLocalById(String(args.id));
        if(!item) return { success: false, errors: `${name} with id '${args.id}' not found.` }

        const result = from(args, this.repositories, true) as Result<DocumentModel>;
        if (!result.success) return result;

        result.result.id = String(args.id);

        const updates = Array.isArray(result.result) ? result.result : [result.result];
        updates.forEach(item => {
          repository.set(item, true)
          console.log("Updated item from repo" + repository.constructor.name, item)
        });

        return result
      },
      userInfo: (_, result) => result ? 
        typeof result === "string" ? result :
        `(Beta) Atualizado ${name}\n${Object
          .entries(result)
          .map(([key, value]) => 
            `- ${key}: ${JSON.stringify(value, null, 2)}`
          ).join("\n")
        }` : undefined
    };

    this.registerDomainAction(name, creator);
    this.registerDomainAction(name, updator);

    if (!customName) this.registerDomainAction(name, deletor);
  }

  protected registerDomainAction(repoName: string, action: AssistantToolDefinition) {
    let domain = this.domains.find(d => d.name === repoName);
    if(!domain) {
      domain = { name: repoName, handlers: [] };
      this.domains.push(domain);
    }
    domain.handlers.push(action);
  }

  protected createSearchMetadata<M extends DocumentModel>(
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

  protected createSearchParamsSchemema(userInfoDescription?: string) {
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

  protected capLimit(limit?: number) {
    return Math.min(MAX_RESULTS, Math.max(1, Math.round(limit ?? MAX_RESULTS)));
  }

  protected normalizeDomainName(name: string) {
    return name.toLowerCase().replace(/([^a-z0-9]+)/g, '');
  }

  protected abstract createDefinitions(): AssistantToolDefinition[] 

}

export enum ToUserTool {
  FINISH = "finish_conversation",
  ONBOARDING_COMPLETE = "onboarding_complete",
  ASK = "ask_user_aditional_info",
};
export enum DomainToolName {
  LIST_ALL = "list_domains",
  LIST_ACTIONS = "list_domain_actions",
  SEARCH_IN_DOMAIN = "search_id_in_domain",
  LIST_ICONS = "search_icon_by_name",
}
export type DomainAction<T = string> = T;
export type Domain<Name extends RepoName> = {
  name: Name;
  search?: (term: string, limit?: number) => Promise<Result<unknown[]>>;
  handlers: AssistantToolDefinition[];
}
