import type { AssistantToolDefinition } from "./types";
import { Similarity } from '../utils/stringSimilarity';
import { AppNavigationTool, navigateToRoute, RoutesDefinition, routesDefinition } from "./routesDefinition";
import { AssistantToolsBase, DomainToolName, MAX_RESULTS, ToUserTool } from "./AssistantToolsBase";

import { iconNamesList } from "@components/Icons";
import { Repositories } from "@repositories";
import {
  Account,
  CreditCard,
  TransferTransaction,
  AccountsRegistry,
  CreditCardRegistry,
  Category,
  Bank,
  RecurrentTransaction as RecurrentTransaction,
} from "@models";

const emptyParamsSchema = { type: "object", properties: {  }, additionalProperties: false,};
export class AssistantTools extends AssistantToolsBase {

  constructor(repositories: Repositories) {
    super(repositories);
    this.setDefinitions(this.createDefinitions());
    console.log(this);
  }

  protected createDefinitions(): AssistantToolDefinition[] {
    const domainNames = this.getDomainNames();

    this.createFromMetadata(Category.metadata, 'categories')
    this.createFromMetadata(Account.metadata, 'accounts')
    this.createFromMetadata(AccountsRegistry.metadata, 'accountTransactions')
    this.createFromMetadata(TransferTransaction.metadata2, 'accountTransactions', `accountTransfersTransactions`)
    this.createFromMetadata(RecurrentTransaction.metadata2, 'recurrentTransactions')
    this.createFromMetadata(CreditCard.metadata, 'creditCards')
    this.createFromMetadata(CreditCardRegistry.metadata, 'creditCardsTransactions')
    this.createSearchMetadata(
      Account.metadata, "Conta", 'accounts',
      (item) => `${item.name} - ${item.type}`,
      ({ id, name, type, bankId }) => ({ id, name, type, bank: this.repositories.banks.getLocalById(bankId)?.name }),
      { filter: (item) => !item.archived },
    )
    this.createSearchMetadata(
      CreditCard.metadata, "Cartão de Crédito", 'creditCards',
      (item) => `${item.name} - ${item.brand}`,
      ({ id, name, brand, accountId }) => ({ id, name, brand, account: this.repositories.accounts.getLocalById(accountId)?.name }),
      { filter: (item) => !item.archived },
    )
    this.createSearchMetadata(
      Category.metadata, "Categoria", 'categories',
      ({name, parentId}) => {
        return parentId ? `${this.repositories.categories.getLocalById(parentId)?.name ?? "??"} -> ${name}` : name;
      },
      ({ id, name, parentId }) => ({ id, name, parent: this.repositories.categories.getLocalById(parentId)?.name }),
    )
    this.createSearchMetadata(
      Bank.metadata, "Banco", 'banks',
      (item) => item.name,
      ({ id, name }) => ({ id, name }),
    )
    this.createSearchMetadata(
      AccountsRegistry.metadata, 'Lançamento de Conta', ['accountTransactions'],
      (item) => `${item.description}, ${item.observation} - ${item.value}`,
      ({ id, description, value, accountId, categoryId, date }) => ({ 
        id, description, value,
        date: date.toISOString().split('T')[0],
        account: this.repositories.accounts.getLocalById(accountId)?.name,
        category: this.repositories.categories.getLocalById(categoryId)?.name,
      }),
    )
    this.createSearchMetadata(
      CreditCardRegistry.metadata, 'Lançamento de Cartão de Crédito', 'creditCardsTransactions',
      (item) => `${item.description}, ${item.observation} - ${item.value}`,
      ({ id, description, value, cardId, categoryId, date }) => ({ 
        id, description, value,
        date: date.toISOString().split('T')[0],
        card: this.repositories.creditCards.getLocalById(cardId)?.name,
        category: this.repositories.categories.getLocalById(categoryId)?.name,
      }),
    )
    this.registerDomainAction('categories',       {
      name: DomainToolName.LIST_ICONS,
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
      {
        name: DomainToolName.LIST_ALL,
        description: "List all available domains in the system.",
        parameters: emptyParamsSchema,
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
          const domain = this.getDomain(domainName);
          if (!domain) return { success: false, errors: `Domain '${domainName}' not found.` };

          this.sharedDomains.add(domainName);
          return { 
            success: true, 
            result: domain.handlers
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
          const domain = this.getDomain(domainName);
          if (!domain) {
            return { success: false, errors: `Domain '${domainName}' not found. Use ${DomainToolName.LIST_ALL} to obtain the list of available domains.` };
          }
          if (!domain?.search) {
            return { success: false, errors: `Domain '${domainName}' has no search capability. Inform user that this is not possible cause you can't obtain information from this domain.` };
          }

          this.sharedDomains.add(domainName);
          return domain.search(query, limit);
        },
        userInfo: (args) => `Searching in '${args.domain}' for '${args.query}'`
      },
      {
        name: AppNavigationTool.NAVIGATE,
        description: `Use when the user wants to "go to" or "see something". Use ${AppNavigationTool.LIST_SCREENS} to obtain the routes to show in the user interface.`,
        parameters: {
          type: "object",
          properties: {
            route: { type: "string", description: "Term to search a screen. use words related to the screen in english" },
            queryParams: { 
              type: "object",
              description: "query parameters for the screen",
              additionalProperties: true,
            }
          }
        },
        execute: navigateToRoute
      },
      {
        name: AppNavigationTool.LIST_SCREENS,
        description: "List the available routes and their parameters when user wants to navigate or see something or go somewhere. (search in english)",
        parameters: this.createSearchParamsSchemema(),
        execute: async ({ query }) => {
          const similarity = new Similarity<RoutesDefinition>(({ name, description, queryParams, pathParams, domains}) => 
            `${name} - ${description}:\n - ${JSON.stringify({ queryParams, pathParams, domains }) }`);
          return {
            success: true,
            result: similarity
              .rank(query, routesDefinition, 5)
              .map(({item: { name, description, queryParams, pathParams}}) => 
                ({ name, description, queryParams, pathParams})
              ),
          }
        },
        userInfo: (args) => `Procurando telas sobre '${args.query}'`
      },
      {
        name: ToUserTool.SAY,
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
        parameters: emptyParamsSchema,
        execute: async () => {
          return { success: true, result: "Pedido concluído contexto resetado." };
        },
      },
    ]
  }

}
