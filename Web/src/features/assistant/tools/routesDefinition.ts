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
  validation?: (value: unknown) => Result;
};

type NavigateToRouteArgs = {
  url: string;
  urlPathParams?: Record<string, unknown>;
  queryParams?: Record<string, unknown>;
};

export type RoutesDefinition = {
  domains?: RepoName[];
  url: string;
  description: string;
  pathParams?: RouteParams;
  queryParams?: RouteParams;
};

const timelineDomains: RepoName[] = ["accountTransactions", "creditCardsInvoices"];

// Important:
// Assistant navigation should prefer stable listing/detail screens that help the user see the current domain state.
// Do not expose create form routes here just to create data, because the assistant should create/update records with tools,
// while navigating the user to the domain listing screen.
export const routesDefinition: RoutesDefinition[] = [
  {
    domains: timelineDomains,
    url: "/timeline",
    description: "Main screen to see the user's timeline of transactions and invoices. Use this route for requests like 'show my timeline', 'show November 2024', 'show this month's records' or similar. For month-based requests, use queryParams.monthKey in YYYY-MM format instead of sending the user to any auxiliary filter screen.",
    queryParams: {
      [TimelineParam.MONTH]: {
        description: 'Main month selector for the timeline. Use YYYY-MM format, for example "2024-11" or "2026-04".',
        required: false,
      },
      account: {
        description: "Comma-separated account IDs to filter the timeline.",
        required: false,
      },
      [TimelineParam.CATEGORY]: {
        description: "Comma-separated category IDs to filter the timeline.",
        required: false,
      },
      [TimelineParam.TAGS]: {
        description: "Comma-separated tags to filter the timeline.",
        required: false,
      },
      [TimelineParam.FROM]: {
        description: "Start date in YYYY-MM-DD format for range mode.",
        required: false,
      },
      [TimelineParam.TO]: {
        description: "End date in YYYY-MM-DD format for range mode.",
        required: false,
      },
      [TimelineParam.TIME_MODE]: {
        description: 'Advanced time filter mode: "month", "range", "last-days" or "last-records". Leave it unset for common month-based timeline requests.',
        required: false,
      },
      [TimelineParam.LAST_DAYS]: {
        description: "Number of days to show when timeMode is last-days.",
        required: false,
      },
      [TimelineParam.RECORD_LIMIT]: {
        description: "Maximum number of records when timeMode is last-records.",
        required: false,
      },
    },
  },
  // {
  //   domains: timelineDomains,
  //   url: "/timeline/filters",
  //   description: "Open the timeline filters screen.",
  // },
  {
    domains: ["accounts", "creditCards"],
    url: "/timeline/import",
    description: "Import transactions from a file into an account or credit card.",
    queryParams: {
      account: { description: "Account ID preselected for the import.", required: false },
      card: { description: "Credit card ID preselected for the import.", required: false },
    },
  },
  {
    domains: ["accounts", "accountTransactions"],
    url: "/timeline/entry/account/{id:string}",
    description: "Open an account transaction in timeline detail view.",
    pathParams: {
      id: { description: "Account transaction ID.", required: true },
    },
  },
  {
    domains: ["creditCards", "creditCardsTransactions"],
    url: "/timeline/entry/credit/{id:string}",
    description: "Open a credit card transaction in timeline detail view.",
    pathParams: {
      id: { description: "Credit card transaction ID.", required: true },
    },
  },
  {
    domains: ["accounts", "accountTransactions"],
    url: "/timeline/entry/transfer/{id:string}",
    description: "Open a transfer transaction in timeline detail view.",
    pathParams: {
      id: { description: "Transfer transaction ID.", required: true },
    },
  },
  {
    domains: ["creditCards", "creditCardsInvoices", "creditCardsTransactions"],
    url: "/timeline/entry/creditcards/{cardId:string}/invoices/{selected?:string}",
    description: "Open credit card invoices inside the timeline detail view.",
    pathParams: {
      cardId: { description: "Credit card ID.", required: true },
      selected: {
        description: 'Selected invoice cycle in YYYYMM format, for example "202604".',
        required: false,
      },
    },
  },
  {
    domains: ["recurrentTransactions"],
    url: "/recurrents",
    description: "View the recurring transactions list.",
  },
  {
    domains: ["recurrentTransactions"],
    url: "/recurrents/{id:string}",
    description: "Edit an existing recurring transaction.",
    pathParams: {
      id: { description: "Recurring transaction ID.", required: true },
    },
  },
  // {
  //   domains: ["groceries"],
  //   url: "/groceries",
  //   description: "View the grocery list.",
  // },
  // {
  //   domains: ["groceries"],
  //   url: "/groceries/removed",
  //   description: "View removed grocery items.",
  // },
  // {
  //   domains: ["groceries"],
  //   url: "/groceries/create",
  //   description: "Create a grocery item.",
  // },
  // {
  //   domains: ["groceries"],
  //   url: "/groceries/{id:string}/edit",
  //   description: "Edit a grocery item.",
  //   pathParams: {
  //     id: { description: "Grocery item ID.", required: true },
  //   },
  // },
  {
    url: "/assistant",
    description: "View assistant conversations history.",
  },
  {
    url: "/assistant/{conversationId:string}",
    description: "Open a specific assistant conversation.",
    pathParams: {
      conversationId: { description: "Assistant conversation ID.", required: true },
    },
  },
  {
    url: "/settings",
    description: "Open the settings hub screen.",
  },
  {
    url: "/settings/app",
    description: "Open app settings.",
  },
  {
    url: "/settings/language",
    description: "Open language settings.",
  },
  // {
  //   url: "/settings/developer",
  //   description: "Open developer settings.",
  // },
  {
    url: "/me/linkedaccounts",
    description: "Open linked auth accounts settings.",
  },
  {
    url: "/me/resource-usage",
    description: "Open resource usage and token consumption statistics.",
  },
  {
    url: "/me/privacy",
    description: "Open privacy settings.",
  },
  // {
  //   url: "/me/privacy/delete",
  //   description: "Open the delete account screen.",
  // },
  {
    url: "/me/privacy/export",
    description: "Open the export personal data screen.",
  },
  {
    domains: ["accounts"],
    url: "/accounts",
    description: "View the bank accounts list.",
  },
  {
    domains: ["accounts"],
    url: "/accounts/{id:string}",
    description: "Edit an existing bank account.",
    pathParams: {
      id: { description: "Bank account ID.", required: true },
    },
  },
  {
    domains: ["creditCards"],
    url: "/creditcards",
    description: "View the credit cards list.",
  },
  {
    domains: ["creditCards"],
    url: "/creditcards/{id:string}",
    description: "Edit an existing credit card.",
    pathParams: {
      id: { description: "Credit card ID.", required: true },
    },
  },
  {
    domains: ["creditCards", "creditCardsInvoices", "creditCardsTransactions"],
    url: "/creditcards/{cardId:string}/invoices/{selected?:string}",
    description: "View credit card invoices and optionally select one invoice cycle.",
    pathParams: {
      cardId: { description: "Credit card ID.", required: true },
      selected: {
        description: 'Selected invoice cycle in YYYYMM format, for example "202604".',
        required: false,
      },
    },
  },
  {
    domains: ["creditCards", "creditCardsInvoices", "creditCardsTransactions"],
    url: "/creditcards/{cardId:string}/invoices/{selected?:string}/entry/credit/{registryId:string}",
    description: "Open a credit card transaction inside a specific invoice detail view.",
    pathParams: {
      cardId: { description: "Credit card ID.", required: true },
      selected: {
        description: 'Selected invoice cycle in YYYYMM format, for example "202604".',
        required: false,
      },
      registryId: { description: "Credit card transaction ID.", required: true },
    },
  },
  {
    domains: ["categories"],
    url: "/categories",
    description: "View the categories list.",
  },
  {
    domains: ["categories"],
    url: "/categories/{id:string}",
    description: "Edit an existing category.",
    pathParams: {
      id: { description: "Category ID.", required: true },
    },
  },
  {
    url: "/subscriptions",
    description: "Open the subscriptions area.",
  },
  // {
  //   url: "/privacy/terms",
  //   description: "Open the terms of service screen.",
  // },
  // {
  //   url: "/privacy/policy",
  //   description: "Open the privacy policy screen.",
  // },
];

function isRouteParamSegment(segment: string): boolean {
  return /^\{[^}]+\}$/.test(segment);
}

function isOptionalRouteParamSegment(segment: string): boolean {
  return /^\{[^}]+\?\}$/.test(segment);
}

function normalizeRoutePath(path: string): string {
  const [pathname] = path.split("?");
  const trimmed = pathname.trim();
  if (!trimmed) return "/";

  const normalized = trimmed.replace(/\/+/g, "/");
  if (normalized === "/") return normalized;
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

function routeMatch(knownRoute: string, aiRoute: string): boolean {
  const knownSegments = normalizeRoutePath(knownRoute).split("/").filter(Boolean);
  const aiSegments = normalizeRoutePath(aiRoute).split("/").filter(Boolean);

  let knownIndex = 0;
  let aiIndex = 0;

  while (knownIndex < knownSegments.length) {
    const knownSegment = knownSegments[knownIndex];
    const aiSegment = aiSegments[aiIndex];

    if (isRouteParamSegment(knownSegment)) {
      if (aiSegment == null) {
        if (isOptionalRouteParamSegment(knownSegment)) {
          knownIndex += 1;
          continue;
        }
        return false;
      }

      knownIndex += 1;
      aiIndex += 1;
      continue;
    }

    if (knownSegment !== aiSegment) return false;
    knownIndex += 1;
    aiIndex += 1;
  }

  return aiIndex === aiSegments.length;
}

function validateParams(type: "path" | "query", match: RoutesDefinition, params?: Record<string, unknown>): string | null {
  const definition = type === "path" ? match.pathParams : match.queryParams;
  const parameters = Object.entries(definition ?? {});
  const allParams = parameters.map(([key]) => key);
  const requiredParams = parameters.filter(([, param]) => param.required).map(([key]) => key);
  const missingParams = requiredParams.filter((param) => {
    const value = params?.[param];
    return value === undefined || value === null || value === "";
  });

  if (missingParams.length) {
    return `Required ${type} parameters missing: ${missingParams.join(", ")}.`;
  }

  const remainingParams = Object.keys(params || {}).filter((key) => !allParams.includes(key));
  if (remainingParams.length) {
    return `Invalid ${type} parameters: ${remainingParams.join(", ")}. Valid parameters are: ${allParams.join(", ")}.`;
  }

  for (const [key, info] of parameters) {
    if (!info.validation || params?.[key] == null || params[key] === "") continue;
    const validation = info.validation(params[key]);
    if (!validation.success) return validation.error;
  }

  return null;
}

function buildRoutePath(route: string, pathParams?: Record<string, unknown>): string {
  const params = pathParams ?? {};

  const resolved = route.replace(/\{([^}:?]+)(?::[^}?]+)?(\?)?\}/g, (_, key: string, optional: string | undefined) => {
    const value = params[key];
    if (value === undefined || value === null || value === "") {
      return optional ? "" : `{${key}}`;
    }

    return encodeURIComponent(String(value));
  });

  return normalizeRoutePath(resolved);
}

function buildUrlWithQuery(path: string, queryParams?: Record<string, unknown>): string {
  if (!queryParams || Object.keys(queryParams).length === 0) return path;

  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export function getDefinitionByExactName(name: string): RoutesDefinition | undefined {
  return routesDefinition.find((route) => route.url === name);
}

export const navigateToRoute: AssistantToolExecution = async ({
  url,
  urlPathParams,
  queryParams,
  ...other
}: NavigateToRouteArgs) => {
  if (other && Object.keys(other).length) {
    return {
      success: false,
      errors: `Parâmetros inválidos: ${Object.keys(other).join(", ")}. use o { url: "${url}", urlPathParams: { key: value }, queryParams: { key: value } } para navegar.`,
    };
  }

  if (!url) {
    return {
      success: false,
      errors: `route is required. use ${AppNavigationTool.LIST_SCREENS} to obtain the list of available screens.`,
    };
  }

  const match = routesDefinition.find((route) => routeMatch(route.url, url));
  if (!match) {
    return {
      success: false,
      errors: `Route '${url}' not found. use ${AppNavigationTool.LIST_SCREENS} to obtain the list of available screens.`,
    };
  }

  const shouldBuildPath = normalizeRoutePath(url) === normalizeRoutePath(match.url);
  if (shouldBuildPath) {
    const pathValidationError = validateParams("path", match, urlPathParams);
    if (pathValidationError) {
      return { success: false, errors: pathValidationError };
    }
  }

  const queryValidationError = validateParams("query", match, queryParams);
  if (queryValidationError) {
    return { success: false, errors: queryValidationError };
  }

  const finalPath = shouldBuildPath ? buildRoutePath(match.url, urlPathParams) : normalizeRoutePath(url);
  if (finalPath.includes("{")) {
    return {
      success: false,
      errors: `Invalid path parameters for route '${match.url}'. Use urlPathParams to fill the required path params.`,
    };
  }

  return { success: true, result: buildUrlWithQuery(finalPath, queryParams) };
};

export enum AppNavigationTool {
  LIST_SCREENS = "search_screens",
  NAVIGATE = "navigate_to_screen",
}
