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
  name: string;
  description: string;
  pathParams?: RouteParams;
  queryParams?: RouteParams;
};

export const routesDefinition: RoutesDefinition[] = [
  {
    name: '/dashboard',
    description: 'Home with balances by account, listing cards for invoice access. main place to view sumarized information',
  },
  {
    name: '/timeline/:id?',
    description: 'See transactions history of financial records, main place to view and manage account transactions. filtering by category, account, date range and month key, etc...',
    pathParams: {
      id: { description: ' account ID to filter', required: false},
    },
    queryParams: {
      c: { description: 'category IDs to filter, separated by commas', required: false },
      f: { description: '`from` filter by initial date', required: false },
      t: { description: '`to` filter by final date', required: false },
      m: { description: 'view Month key (e.g., 2025-09)', required: false },
    },
  },
  {
    name: '/timeline/import',
    description: 'MUST use query params. Use files to import transactions. Required one IDs of an account or a card.'+
    'When load with the query params, the screen will automatically prompt the file selection.',
    queryParams: {
      account: { description: 'Account ID to import into (search the id on accounts domain)', required: false },
      card: { description: 'Credit card ID to import into (search the id on creditcards domain)', required: false },
    },
  },
  {
    name: '/recurrent',
    description: 'View the list of recurring registries with their schedule information',
  },
  // {
  //   name: '/timeline/filters',
  //   description: 'Timeline filter screen for manual adjustment of filters',
  // },
  {
    name: '/groceries',
    description: 'Grocery list/pantry, here you can manage your shopping items market',
  },
  {
    name: '/groceries/removed',
    description: 'Removed items from the grocery/pantry list',
  },
  {
    name: '/settings',
    description: 'Settings and application configuration',
  },
  {
    name: '/settings/ai-calls',
    description: 'Review AI assistant conversations and inspect saved call logs',
  },
  {
    name: '/resource-usage',
    description: 'Resource usage statistics',
  },
  {
    name: '/accounts',
    description: 'Bank accounts listing and manual management',
  },
  // {
  //   name: '/accounts/create',
  //   description: 'Create bank account manually',
  // },
  // {
  //   name: '/accounts/:id/edit',
  //   description: 'Edit a especific bank account info manually',
  //   pathParams: { id: { description: 'ID da conta bancária', required: true } },
  // },
  // {
  //   name: '/accounts/registry/add',
  //   description: 'Add a spend record to the account manually',
  // },
  {
    name: '/accounts/registry/:id/edit',
    description: 'Edit bank account info manually',
    pathParams: { id: { description: 'ID of the account registry', required: true } }
  },
  {
    name: '/creditcards',
    description: 'View credit cards to view, listi and manage infos like limits, due dates and etc...',
  },
  // {
  //   name: '/creditcards/create',
  //   description: 'Create credit card manually',
  // },
  {
    name: '/creditcards/:id',
    description: 'View credit card info details',
    pathParams: { id: { description: 'credit card ID', required: true } },
  },
  // {
  //   name: '/creditcards/:id/edit',
  //   description: 'Edit credit card info manually',
  // },
  {
    name: '/creditcards/:id/invoices/:selected?',
    description: 'View credit card invoices, list all invoices and details or the selected one',
    pathParams: {
      id: { description: 'credit card ID', required: true },
      selected: { description: 'ID of the selected invoice as Month key (e.g., 2025-09)', required: false },
    }
  },
  // {
  //   name: '/creditcards/registry/add',
  //   description: 'Adicionar registro de cartão de crédito',
  // },
  // {
  //   name: '/creditcards/registry/:id/edit',
  //   description: 'Editar registro de cartão de crédito',
  // },
  {
    name: '/categories',
    description: 'View the categories listing and manage categories manually',
  },
  // {
  //   name: '/categories/create',
  //   description: 'Criar nova categoria manualmente',
  // },
  // {
  //   name: '/groceries/create',
  //   description: 'Adicionar item à lista de compras',
  // },
  // {
  //   name: '/groceries/:id/edit',
  //   description: 'Editar item da lista de compras',
  //   pathParams: { id: { description: 'ID do item de compra' } },
  // },
  {
    name: '/subscriptions/',
    description: 'See avalilable subscriptions plans and manage your current plan',
  }
];

export const stringRoutesDefinition = routesDefinition.map(route => JSON.stringify(route));

export function routeMatch(knownRoute: string, aiRoute: string): boolean {
  const goRoute = aiRoute.split('?')[0];
  const configRoute = knownRoute
    .replace(/\/:[\w]+\?/g, '(\/[^\]*)*')
    .replace(/\/:[\w]+/g, '(\/[^\/]+)+');
  const regex = new RegExp(`^${configRoute}$`);
  return regex.test(goRoute);
}

export function getDefinitionByExactName(name: string): RoutesDefinition | undefined {
  return routesDefinition.find(route => route.name === name);
}