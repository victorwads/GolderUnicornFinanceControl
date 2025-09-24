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
    description: 'Home with balances by account, listing cards for invoice access',
  },
  {
    name: '/timeline/:id?',
    description: 'Timeline of financial records, here you can list and filter records.',
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
  {
    name: '/accounts/registry/add',
    description: 'Add a spend record to the account manually',
  },
  {
    name: '/accounts/registry/:id/edit',
    description: 'Edit bank account info manually',
    pathParams: { id: { description: 'ID do registro do registro', type: 'path_param_string', required: true } }
  },
  {
    name: '/creditcards',
    description: 'Credit cards listing',
  },
  // {
  //   name: '/creditcards/create',
  //   description: 'Create credit card manually',
  // },
  {
    name: '/creditcards/:id',
    description: 'View credit card info details',
    pathParams: { id: { description: 'ID do cartão de crédito', type: 'path_param_string', required: true } },
  },
  {
    name: '/creditcards/:id/edit',
    description: 'Edit credit card info manually',
  },
  {
    name: '/creditcards/:id/invoices/:selected?',
    description: 'View Credit Card Invoices',
    pathParams: {
      id: { description: 'ID do cartão de crédito', type: 'path_param_string', required: true },
      selected: { description: 'ID da fatura selecionada as Month key (e.g., 2025-09)', type: 'path_param_string', required: false },
    }
  },
  {
    name: '/creditcards/registry/add',
    description: 'Adicionar registro de cartão de crédito',
  },
  // {
  //   name: '/creditcards/registry/:id/edit',
  //   description: 'Editar registro de cartão de crédito',
  // },
  {
    name: '/categories',
    description: 'Listagem de Categorias',
  },
  {
    name: '/categories/create',
    description: 'Criar nova categoria manualmente',
  },
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
    name: '/subscriptions/*',
    description: 'Tela para visualizar planos de assinaturas disponíveis',
  }
];

export const stringRoutesDefinition = routesDefinition.map(route => JSON.stringify(route));

// Função utilitária para listar os parâmetros possíveis da rota TimeLine
export function listTimelineFilterParams() {
  const timelineRoute = routesDefinition.find(r => r.name.startsWith('/timeline'));
  if (!timelineRoute || !timelineRoute.params) return [];
  return Object.entries(timelineRoute.params).map(([key, info]) => `${key}: ${info.description}`);
}
