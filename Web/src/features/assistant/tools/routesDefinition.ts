import { TimelineParam } from "@features/tabs/timeline/TimelineScreen.model";
import { RepoName } from "@repositories";
import { AssistantToolExecution } from "./types";

type Result =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

type RouteParams = Record<string, RouteParamsInfo>;

type RouteParamsInfo = {
  description: string;
  required: boolean;
  validation?: (value: any) => Result;
};

export type RoutesDefinition = {
  domains?: RepoName[];
  url: string;
  description: string;
  pathParams?: RouteParams;
  queryParams?: RouteParams;
};

const timeLineDomains: RepoName[] = ['accountTransactions', 'creditCardsInvoices'];

export const routesDefinition: RoutesDefinition[] = [
  {
    domains: ['accounts', "creditCardsInvoices", 'creditCards'],
    url: '/dashboard',
    description: 'Home page with balances by account, listing cards for invoice access. main place to view sumarized information',
  },
  {
    domains: timeLineDomains,
    url: '/timeline/{accountId?:string}',
    description: 'See transactions history of financial records, you mainlly use month key to filter the transactions by month, but you can also use other filters like categories, accounts and date range.',
    pathParams: {
      accountId: { description: 'use only if user explicitly asks for a specific account name, then search the id in accounts domain. Otherwise dont use it in url', required: false},
    },
    queryParams: {
      [TimelineParam.MONTH]: { description: 'View a specific month period, value should be a "month key" (e.g., 2024-09) YYYY-MM', required: false },
      [TimelineParam.CATEGORY]: { description: 'categories IDs to filter, separated by commas', required: false },
      [TimelineParam.FROM]: { description: 'filter register since date x YYYY-MM-DD, should be used with `until` param', required: false },
      [TimelineParam.TO]: { description: 'filter register until date y YYYY-MM-DD, should be used with `from` param', required: false },
    },
  },
  // {
  //   domains: timeLineDomains,
  //   name: '/timeline/import',
  //   description: 'MUST use query params. Use files to import transactions. Required one IDs of an account or a card.'+
  //   'When load with the query params, the screen will automatically prompt the file selection.',
  //   queryParams: {
  //     account: { description: 'Account ID to import into (search the id on accounts domain)', required: false },
  //     card: { description: 'Credit card ID to import into (search the id on creditcards domain)', required: false },
  //   },
  // },
  {
    domains: ['recurrentTransactions'],
    url: '/recurrent',
    description: 'View the list of recurring registries with their schedule information',
  },
  // {
  //   name: '/timeline/filters',
  //   description: 'Timeline filter screen for manual adjustment of filters',
  // },
  // {
  //   url: '/groceries',
  //   description: 'Grocery list/pantry, here you can manage your shopping items market',
  // },
  // {
  //   url: '/groceries/removed',
  //   description: 'Removed items from the grocery/pantry list',
  // },
  {
    url: '/settings',
    description: 'Settings and application configuration',
  },
  {
    url: '/ai-calls',
    description: 'View conversations history with the AI assistant with information about tokens used and cost',
  },
  {
    url: '/resource-usage',
    description: 'Resource usage statistics to see how many tokens you have used in the current month and the cost',
  },
  {
    url: '/accounts',
    description: 'Bank accounts listing and manual management',
  },
  // {
  //   name: '/accounts/{id:string}/edit',
  //   description: 'Edit a especific bank account info manually',
  //   pathParams: { id: { description: 'ID da conta bancária', required: true } },
  // },
  {
    url: '/accounts/registry/{id:string}/edit',
    description: 'See a bank account transaction or edit it manually',
    pathParams: { id: { description: 'ID of the account registry', required: true } }
  },
  {
    domains: ['creditCards'],
    url: '/creditcards',
    description: 'View credit cards list for managing and viewing details like limits, due dates and etc...',
  },
  {
    domains: ['creditCards'],
    url: '/creditcards/{id:string}/edit',
    description: 'View a specific credit card details like limits, due dates and etc... or edit it manually',
  },
  {
    domains: ['creditCards', 'creditCardsTransactions', 'creditCardsInvoices'],
    url: '/creditcards/{id:string}/invoices/{year-month?:string}',
    description: 'View credit card invoices, list all invoices and details or the selected one',
    pathParams: {
      id: { description: 'credit card ID', required: true },
      selected: { description: 'ID of the selected invoice as Month key (e.g., 2025-09)', required: false },
    }
  },
  {
    domains: ['creditCards', 'creditCardsTransactions'],
    url: '/creditcards/registry/{id:string}/edit',
    description: 'View some credit card transaction registry or edit it manually',
    pathParams: { id: { description: 'ID of the credit card registry', required: true } }
  },
  {
    url: '/categories',
    description: 'View the categories listing or manage it manually',
  },
  {
    url: '/subscriptions',
    description: 'See avalilable subscriptions plans and manage your current plan',
  }
];

function routeMatch(knownRoute: string, aiRoute: string): boolean {
  const goRoute = aiRoute.split('?')[0];
  const configRoute = knownRoute
    .replace(/\{[\w\:\?]+\}/g, '([^\]*)*')
  const regex = new RegExp(`^${configRoute}$`);
  return regex.test(goRoute);
}

export function getDefinitionByExactName(name: string): RoutesDefinition | undefined {
  return routesDefinition.find(route => route.url === name);
}

export const navigateToRoute: AssistantToolExecution = async (
  { url, queryParams, ...other }: { url: string, queryParams?: Record<string, any> }
) => {
  if(other && Object.keys(other).length) {
    return { success: false, errors: `Parâmetros inválidos: ${Object.keys(other).join(", ")}. use o { route: '${url}', queryParams: { key: value } } para navegar.` };
  }

  if(!url) return { success: false, errors: `route is required. use ${AppNavigationTool.LIST_SCREENS} to obtain the list of available screens.` };
  const match = routesDefinition.find(r => routeMatch(r.url, url));
  if(!match) {
    return { success: false, errors: `Route '${url}' not found. use ${AppNavigationTool.LIST_SCREENS} to obtain the list of available screens.` };
  }

  const validationError = validateParams('query', match, queryParams);
  if (validationError) {
    return { success: false, errors: validationError };
  }

  return { success: true, result: url };
}

function validateParams(type: 'path' | 'query', match: RoutesDefinition, params?: any): string | null {
  const parameters = Object.entries(match.queryParams ?? {});
  const allParams = parameters.map(([key]) => key);
  const requiredParams = parameters.filter(([_, param]) => param.required).map(([key]) => key);
  const missingParams = requiredParams.filter(param => !params || !(param in params));
  if(missingParams.length) {
    return `Required ${type} parameters missing: ${missingParams.join(", ")}.`
  }

  const remainingParams = Object.keys(params || {}).filter(key => !allParams.includes(key));
  if(remainingParams.length) {
    return `Invalid ${type} parameters: ${remainingParams.join(", ")}. Valid parameters are: ${allParams.join(", ")}.`
  }

  return null;
}

export enum AppNavigationTool {
  LIST_SCREENS = "search_screens",
  NAVIGATE = "navigate_to_screen",
}
