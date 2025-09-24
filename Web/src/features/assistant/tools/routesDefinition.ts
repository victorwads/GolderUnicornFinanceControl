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
  type: 'path_param_string' | 'query_param_string';
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
      id: { description: ' account ID to filter', type: 'path_param_string', required: false},
    },
    queryParams: {
      c: { description: 'category IDs to filter, separated by commas', type: 'query_param_string', required: false },
      f: { description: '`from` filter by initial date', type: 'query_param_string', required: false },
      t: { description: '`to` filter by final date', type: 'query_param_string', required: false },
      m: { description: 'view Month key (e.g., 2025-09)', type: 'query_param_string', required: false },
    },
  },
  // {
  //   name: '/timeline/filters',
  //   description: 'Timeline filter screen for manual adjustment of filters',
  // },
  {
    name: '/groceries',
    description: 'Grocery list/pantry, here you can manage your shopping items',
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
  //   pathParams: { id: { description: 'ID da conta bancária', type: 'path_param_string', required: true } },
  // },
  // {
  //   name: '/accounts/registry/add',
  //   description: 'Add a spend record to the account manually',
  // },
  {
    name: '/accounts/registry/:id/edit',
    description: 'Edit bank account info manually',
    pathParams: { id: { description: 'ID of the account registry', type: 'path_param_string', required: true } }
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
    pathParams: { id: { description: 'credit card ID', type: 'path_param_string', required: true } },
  },
  // {
  //   name: '/creditcards/:id/edit',
  //   description: 'Edit credit card info manually',
  // },
  {
    name: '/creditcards/:id/invoices/:selected?',
    description: 'View credit card invoices, list all invoices and details or the selected one',
    pathParams: {
      id: { description: 'credit card ID', type: 'path_param_string', required: true },
      selected: { description: 'ID of the selected invoice as Month key (e.g., 2025-09)', type: 'path_param_string', required: false },
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
  //   pathParams: { id: { description: 'ID do item de compra', type: 'path_param_string' } },
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
