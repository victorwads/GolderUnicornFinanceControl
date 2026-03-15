import type { AssistantTimelineEntry, AssistantToolKind, PrimitiveRecord } from "./assistantHistory.types";

type ToolDescription = {
  toolKind: AssistantToolKind;
  title: string;
  description: string;
};

export function describeTool(toolName: string, args: PrimitiveRecord, result: PrimitiveRecord): ToolDescription {
  const LocalLang = Lang.visual.assistant.adapter;
  const domainLabel = getDomainLabel(stringifyValue(args.domain));
  const primaryResultLabel = extractPrimaryResultLabel(result);

  switch (true) {
    case toolName === "search_id_in_domain":
      return {
        toolKind: "search",
        title: LocalLang.searchInDomainTitle(domainLabel),
        description: primaryResultLabel
          ? LocalLang.searchInDomainFound(stringifyValue(args.query), primaryResultLabel)
          : LocalLang.searchInDomainFallback(stringifyValue(args.query), domainLabel),
      };

    case toolName === "search_screens": {
      const screenLabel = extractScreenName(result);
      return {
        toolKind: "search",
        title: LocalLang.searchedScreensTitle,
        description: screenLabel
          ? LocalLang.searchedScreensFound(stringifyValue(args.query), screenLabel)
          : LocalLang.searchedScreensFallback(stringifyValue(args.query)),
      };
    }

    case toolName === "navigate_to_screen": {
      const routeLabel = getRouteLabel(stringifyValue(result.result) || stringifyValue(args.url));
      return {
        toolKind: "navigate",
        title: result.success === false ? LocalLang.attemptedScreenTitle : LocalLang.openedScreenTitle,
        description:
          result.success === false
            ? stringifyValue(result.errors) || LocalLang.attemptedScreenDescription(routeLabel)
            : LocalLang.openedScreenDescription(routeLabel),
      };
    }

    case toolName === "say_to_user": {
      const message = stringifyValue(args.message) || LocalLang.askForInfoFallback;
      return {
        toolKind: "ask",
        title: classifySayToUserTitle(message),
        description: truncateText(message, 140),
      };
    }

    case toolName === "finish_conversation":
      return {
        toolKind: "finish",
        title: LocalLang.finishedConversationTitle,
        description: stringifyValue(result.result) || LocalLang.finishedFlowFallback,
      };

    case toolName === "finish_onboarding":
      return {
        toolKind: "finish",
        title: LocalLang.finishedOnboardingTitle,
        description: stringifyValue(result.result) || LocalLang.finishedFlowFallback,
      };

    case toolName === "list_domains": {
      const domainsCount = Array.isArray(result.result) ? result.result.length : 0;
      return {
        toolKind: "search",
        title: LocalLang.listedDomainsTitle,
        description: domainsCount > 0 ? LocalLang.listedDomainsDescription(domainsCount) : LocalLang.listedDomainsFallback,
      };
    }

    case toolName === "list_domain_actions": {
      const actionsCount = Array.isArray(result.result) ? result.result.length : 0;
      return {
        toolKind: "search",
        title: LocalLang.listedDomainActionsTitle(domainLabel),
        description:
          actionsCount > 0
            ? LocalLang.listedDomainActionsDescription(domainLabel, actionsCount)
            : LocalLang.listedDomainActionsFallback(domainLabel),
      };
    }

    case toolName.endsWith("_create"): {
      const entityLabel = getEntityLabel(toolName, "_create");
      return {
        toolKind: "create",
        title: LocalLang.createTitle(entityLabel),
        description: primaryResultLabel
          ? LocalLang.createDescription(entityLabel, primaryResultLabel)
          : LocalLang.createFallback,
      };
    }

    case toolName.endsWith("_update"): {
      const entityLabel = getEntityLabel(toolName, "_update");
      return {
        toolKind: "update",
        title: LocalLang.updateTitle(entityLabel),
        description: primaryResultLabel
          ? LocalLang.updateDescription(entityLabel, primaryResultLabel)
          : LocalLang.updateFallback,
      };
    }

    case toolName.endsWith("_delete_by_id"): {
      const entityLabel = getEntityLabel(toolName, "_delete_by_id");
      return {
        toolKind: "delete",
        title: LocalLang.deleteTitle(entityLabel),
        description: stringifyValue(args.id)
          ? LocalLang.deleteDescription(entityLabel, stringifyValue(args.id))
          : LocalLang.deleteFallback,
      };
    }

    case toolName.endsWith("_count"): {
      const entityLabel = getEntityLabel(toolName, "_count");
      const count = extractCountValue(result);
      return {
        toolKind: "search",
        title: LocalLang.countTitle(entityLabel),
        description: count !== null ? LocalLang.countDescription(count, entityLabel) : LocalLang.countFallback,
      };
    }

    default:
      return {
        toolKind: "search",
        title: humanizeTechnicalName(toolName),
        description: stringifyValue(result.result) || LocalLang.genericToolFallback,
      };
  }
}

export function buildToolChips(toolName: string, args: PrimitiveRecord, result: PrimitiveRecord): string[] {
  const LocalLang = Lang.visual.assistant.adapter;
  const chips = new Set<string>();

  if (typeof args.domain === "string") chips.add(getDomainLabel(args.domain));
  if (typeof args.url === "string") chips.add(getRouteLabel(args.url));

  const resultItems = Array.isArray(result.result) ? result.result : null;
  if (resultItems?.length) chips.add(LocalLang.resultCount(resultItems.length));

  if (typeof args.query === "string") chips.add(truncateText(args.query, 24));
  if (typeof args.id === "string") chips.add(args.id);

  return Array.from(chips).filter(Boolean).slice(0, 3);
}

export function buildArgumentsPreview(toolName: string, args: PrimitiveRecord): string {
  switch (true) {
    case toolName === "navigate_to_screen": {
      const url = stringifyValue(args.url);
      const query = isObject(args.queryParams)
        ? new URLSearchParams(Object.entries(args.queryParams).map(([key, value]) => [key, stringifyValue(value)])).toString()
        : "";
      return query ? `${url}?${query}` : url;
    }

    default:
      return Object.entries(args)
        .slice(0, 3)
        .map(([key, value]) => `${key}=${stringifyValue(value)}`)
        .join(", ");
  }
}

export function buildResultPreview(result: PrimitiveRecord): string {
  const LocalLang = Lang.visual.assistant.adapter;

  switch (true) {
    case typeof result.result === "string":
      return truncateText(result.result, 120);
    case Array.isArray(result.result):
      return LocalLang.resultCount(result.result.length);
    case result.success === false:
      return stringifyValue(result.errors) || LocalLang.failureFallback;
    case result.success === true:
      return LocalLang.successFallback;
    default:
      return JSON.stringify(result).slice(0, 120);
  }
}

export function isObject(value: unknown): value is PrimitiveRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value == null) return "";
  return JSON.stringify(value);
}

export function truncateText(value: string, limit: number): string {
  return value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
}

function classifySayToUserTitle(message: string): string {
  const LocalLang = Lang.visual.assistant.adapter;
  const normalized = message.toLowerCase();

  switch (true) {
    case normalized.includes("gostaria de começar") || normalized.includes("shall we start"):
      return LocalLang.startedInteraction;
    case normalized.includes("?") || normalized.includes("quer") || normalized.includes("prefere") || normalized.includes("gostaria"):
      return LocalLang.askedForConfirmation;
    case normalized.includes("criei") || normalized.includes("salvei") || normalized.includes("atualizei") || normalized.includes("prontinho"):
      return LocalLang.confirmedAction;
    case normalized.includes("tchau") || normalized.includes("até logo") || normalized.includes("goodbye"):
      return LocalLang.saidGoodbye;
    default:
      return LocalLang.repliedToUser;
  }
}

function extractPrimaryResultLabel(result: PrimitiveRecord): string {
  if (isObject(result.result)) {
    return stringifyValue(result.result.name || result.result.info || result.result.title || result.result.description);
  }

  if (Array.isArray(result.result) && result.result.length > 0) {
    const firstItem = result.result[0];
    if (isObject(firstItem)) {
      return stringifyValue(firstItem.name || firstItem.info || firstItem.title || firstItem.description);
    }
  }

  return "";
}

function extractScreenName(result: PrimitiveRecord): string {
  if (!Array.isArray(result.result) || result.result.length === 0) return "";
  const firstItem = result.result[0];
  if (!isObject(firstItem)) return "";
  return getRouteLabel(stringifyValue(firstItem.name));
}

function extractCountValue(result: PrimitiveRecord): number | null {
  if (isObject(result.result) && typeof result.result.count === "number") return result.result.count;
  if (typeof result.result === "number") return result.result;
  return null;
}

function getEntityLabel(toolName: string, suffix: string): string {
  const entityName = toolName.replace(suffix, "").trim();
  return getDomainLabel(entityName);
}

function getDomainLabel(domain: string): string {
  const labels = Lang.visual.assistant.adapter.domains;

  switch (domain) {
    case "aiCalls":
      return labels.aiCalls;
    case "accountTransactions":
      return labels.accountTransactions;
    case "accounts":
      return labels.accounts;
    case "banks":
      return labels.banks;
    case "categories":
      return labels.categories;
    case "creditCards":
      return labels.creditCards;
    case "creditCardsInvoices":
      return labels.creditCardsInvoices;
    case "creditCardsTransactions":
      return labels.creditCardsTransactions;
    case "recurrentTransactions":
      return labels.recurrentTransactions;
    case "resourcesUse":
      return labels.resourcesUse;
    default:
      return humanizeTechnicalName(domain).toLowerCase();
  }
}

function getRouteLabel(route: string): string {
  const labels = Lang.visual.assistant.adapter.routes;

  switch (route) {
    case "/accounts":
      return labels.accounts;
    case "/creditcards":
      return labels.creditCards;
    case "/dashboard":
      return labels.dashboard;
    case "/recurrent":
      return labels.recurrent;
    case "/settings":
      return labels.settings;
    case "/subscriptions":
      return labels.subscriptions;
    case "/timeline":
      return labels.timeline;
    default:
      return route || "";
  }
}

function humanizeTechnicalName(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
