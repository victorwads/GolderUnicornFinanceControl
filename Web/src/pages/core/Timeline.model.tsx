import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import getRepositories, { waitUntilReady } from "@repositories";
import { getServices } from "@services";
import {
  AccountsRegistry,
  CreditCardRegistry,
  InvoiceTransaction,
  RegistryType,
  RegistryWithDetails,
  TransferTransaction,
} from "@models";
import routes from "@features/navigate";
import FinancialMonthPeriod, { Month, MonthKey } from "@utils/FinancialMonthPeriod";
import { SelectListOption } from "@components/ui/select-list";
import { buildHierarchicalCategoryOptions } from "@pages/categories/categorySelectOptions";
import {
  TimelineData,
  TimelineRoute,
  TimelineTexts,
  TimelineViewModel,
  ToClearHistoryRoute,
  ToEditTransactionRoute,
  ToExportRoute,
  ToImportRoute,
  ToOpenFiltersRoute,
  ToStatisticsRoute,
  Transaction,
} from "@layouts/core/Timeline";
import { TimelineParam } from "@features/tabs/timeline/TimelineScreen.model";

const FILTER_ACCOUNT_PARAM = "account";
const RECORD_WARNING_THRESHOLD = 2500;

type TimelineTimeFilterMode = "month" | "range" | "last-days" | "last-records";

type RouteState = {
  accountIds: string[];
  timeMode: TimelineTimeFilterMode;
  month: Month;
  period?: { start: Date; end: Date };
  filterSince?: Date;
  filterUntil?: Date;
  lastDays?: number;
  recordLimit?: number;
  categoryIds: string[];
  tags: string[];
};

function parseOptionalDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function parsePositiveInteger(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function subtractDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() - days);
  return next;
}

function buildTimelinePath() {
  return "/timeline";
}

function buildTimelineSearch(params: URLSearchParams): string {
  const query = params.toString();
  return query ? `?${query}` : "";
}

function getTransactionRoute(item: RegistryWithDetails, search: string): string {
  const { registry } = item;

  if (registry instanceof InvoiceTransaction) {
    return routes.timelineInvoice(registry.cardId, registry.name, search);
  }
  if (registry instanceof TransferTransaction || registry.type === RegistryType.TRANSFER) {
    return routes.timelineTransfer(registry.id, search);
  }
  if (registry instanceof CreditCardRegistry) {
    return routes.timelineCredit(registry.id, search);
  }
  return routes.timelineDebit(registry.id, search);
}

function getTransactionType(item: RegistryWithDetails): Transaction["transactionType"] {
  const { registry } = item;

  if (registry instanceof InvoiceTransaction) return "invoice";
  if (registry instanceof TransferTransaction || registry.type === RegistryType.TRANSFER) return "transfer";
  if (registry instanceof CreditCardRegistry) return "credit";
  if (registry.type === RegistryType.ACCOUNT_RECURRENT || registry.type === RegistryType.CREDIT_RECURRENT) {
    return "recurring";
  }
  if (registry instanceof AccountsRegistry) return "debit";

  return undefined;
}

export function useTimelineModel(): TimelineViewModel {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [summary, setSummary] = useState<{ income: number; expense: number; balance: number } | null>(null);
  const [searchText, setSearchText] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(() => localStorage.getItem("timeline-compact-mode") === "true");
  const [filterAccounts, setFilterAccounts] = useState<string[]>([]);
  const [timeFilterMode, setTimeFilterMode] = useState<TimelineTimeFilterMode>("month");
  const [filterMonth, setFilterMonth] = useState<Month>(() => new FinancialMonthPeriod().getMonthForDate(new Date()));
  const [filterSince, setFilterSince] = useState<Date | undefined>();
  const [filterUntil, setFilterUntil] = useState<Date | undefined>();
  const [filterLastDays, setFilterLastDays] = useState<number>(30);
  const [filterRecordLimit, setFilterRecordLimit] = useState<string>("500");
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [accountOptions, setAccountOptions] = useState<SelectListOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectListOption[]>([]);
  const [tagOptions, setTagOptions] = useState<SelectListOption[]>([]);
  const routeTargetsRef = useRef<Record<string, string>>({});

  const locale = CurrentLangInfo.short;
  const isFilterModalOpen = location.pathname === "/timeline/filters";

  const routeState = useMemo<RouteState>(() => {
    let fallbackPeriod = new FinancialMonthPeriod();
    let firstRegistryDate = new Date();

    try {
      const { timeline } = getServices();
      fallbackPeriod = timeline.period;
      firstRegistryDate = timeline.getFirstRegistryDate();
    } catch {
      // The timeline route can render before repositories bootstrap on refresh.
    }

    const monthParam = searchParams.get(TimelineParam.MONTH);
    const requestedTimeMode = searchParams.get(TimelineParam.TIME_MODE) as TimelineTimeFilterMode | null;
    const since = parseOptionalDate(searchParams.get(TimelineParam.FROM));
    const until = parseOptionalDate(searchParams.get(TimelineParam.TO));
    const lastDays = parsePositiveInteger(searchParams.get(TimelineParam.LAST_DAYS));
    const recordLimit = parsePositiveInteger(searchParams.get(TimelineParam.RECORD_LIMIT));
    const accountIds = searchParams.get(FILTER_ACCOUNT_PARAM)?.split(",").filter(Boolean) ?? [];
    const fallbackMonth = fallbackPeriod.getMonthForDate(new Date());
    const month = monthParam ? Month.fromKey(monthParam as MonthKey) : since ? Month.fromDate(since) : fallbackMonth;
    const today = new Date();

    let timeMode: TimelineTimeFilterMode = "month";
    if (requestedTimeMode === "last-records" && recordLimit) {
      timeMode = "last-records";
    } else if (requestedTimeMode === "last-days" && lastDays) {
      timeMode = "last-days";
    } else if (requestedTimeMode === "range" && (since || until)) {
      timeMode = "range";
    }

    const period = (() => {
      switch (timeMode) {
        case "range": {
          const start = startOfDay(since || firstRegistryDate);
          const end = endOfDay(until || today);
          return { start, end };
        }
        case "last-days": {
          const safeLastDays = lastDays || 30;
          const end = endOfDay(today);
          return { start: startOfDay(subtractDays(today, safeLastDays - 1)), end };
        }
        case "last-records":
          return undefined;
        case "month":
        default:
          return fallbackPeriod.getMonthPeriod(month);
      }
    })();

    return {
      accountIds,
      timeMode,
      month,
      period,
      filterSince: since,
      filterUntil: until,
      lastDays,
      recordLimit,
      categoryIds: searchParams.get(TimelineParam.CATEGORY)?.split(",").filter(Boolean) ?? [],
      tags: searchParams.get(TimelineParam.TAGS)?.split(",").filter(Boolean) ?? [],
    };
  }, [searchParams]);

  const isTimeRangeFilterActive = routeState.timeMode !== "month";
  const hasActiveFilters = Boolean(
    routeState.accountIds.length ||
    routeState.categoryIds.length ||
    routeState.tags.length ||
    isTimeRangeFilterActive
  );

  useEffect(() => {
    localStorage.setItem("timeline-compact-mode", JSON.stringify(isCompact));
  }, [isCompact]);

  useEffect(() => {
    setFilterAccounts(routeState.accountIds);
    setTimeFilterMode(routeState.timeMode);
    setFilterMonth(routeState.month);
    setFilterSince(routeState.filterSince);
    setFilterUntil(routeState.filterUntil);
    setFilterLastDays(routeState.lastDays || 30);
    setFilterRecordLimit(routeState.recordLimit ? String(routeState.recordLimit) : "500");
    setFilterCategories(routeState.categoryIds);
    setFilterTags(routeState.tags);
  }, [routeState]);

  useEffect(() => {
    if (searchText) setIsSearchOpen(true);
  }, [searchText]);

  const syncReferenceData = useCallback(() => {
    const repositories = getRepositories();
    const accounts = repositories.accounts.getCacheWithBank(true).map((account) => ({
      value: account.id,
      label: account.name,
      iconUrl: account.bank.logoUrl,
      backgroundColor: account.color,
    }));
    const categories = buildHierarchicalCategoryOptions(repositories.categories.getCache());
    const tags = Array.from(new Set(
      repositories.accountTransactions.getCache().flatMap((registry) => registry.tags || [])
    ))
      .sort((a, b) => a.localeCompare(b, CurrentLangInfo.short))
      .map<SelectListOption>((tag) => ({ label: tag, value: tag }));

    setAccountOptions(accounts);
    setCategoryOptions(categories);
    setTagOptions(tags);
  }, []);

  const loadTimeline = useCallback(async () => {
    setTimelineData(null);
    setSummary(null);

    await waitUntilReady("accounts", "categories", "accountTransactions", "creditCards", "creditCardsInvoices");
    syncReferenceData();

    const { timeline, balance } = getServices();
    const currentSearch = buildTimelineSearch(new URLSearchParams(searchParams));
    const registries = timeline.getAccountItems({
      period: searchText ? undefined : routeState.period,
      accountIds: routeState.accountIds,
      categoryIds: routeState.categoryIds,
      tags: routeState.tags,
      limit: routeState.timeMode === "last-records" ? routeState.recordLimit : undefined,
      search: searchText,
    });

    const grouped = registries.reduce<TimelineData>((acc, item) => {
      const targetRoute = getTransactionRoute(item, currentSearch);
      routeTargetsRef.current[item.registry.id] = targetRoute;

      const key = item.registry.date.toLocaleDateString(locale, {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const mapped: Transaction = {
        id: item.registry.id,
        title: item.registry.description,
        category: item.category?.name || "Sem categoria",
        categoryIconName: item.category?.icon,
        categoryColor: item.category?.color,
        amount: item.registry.value,
        date: item.registry.date.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: item.registry.value >= 0 ? "income" : "expense",
        account: item.sourceName,
        isPaid: item.registry.paid,
        transactionType: getTransactionType(item),
        tags: item.registry.tags || [],
      };

      if (!acc[key]) acc[key] = [];
      acc[key].push(mapped);
      return acc;
    }, {});

    const mapped = Object.values(grouped).flat();

    const income = mapped.filter((item) => item.amount > 0).reduce((total, item) => total + item.amount, 0);
    const expense = mapped.filter((item) => item.amount < 0).reduce((total, item) => total + Math.abs(item.amount), 0);

    setTimelineData(grouped);
    setSummary({
      income,
      expense,
      balance: balance.getBalance(routeState.accountIds, routeState.period?.end || new Date()),
    });
  }, [locale, routeState, searchParams, searchText, syncReferenceData]);

  useEffect(() => {
    let active = true;
    let unsubscribe: Array<() => void> = [];

    const run = async () => {
      await waitUntilReady("accounts", "categories", "accountTransactions", "creditCards", "creditCardsInvoices");
      if (!active) return;

      await loadTimeline();
      if (!active) return;

      const repositories = getRepositories();
      unsubscribe = [
        repositories.accounts.addUpdatedEventListenner(() => {
          syncReferenceData();
          loadTimeline();
        }),
        repositories.categories.addUpdatedEventListenner(() => {
          syncReferenceData();
          loadTimeline();
        }),
        repositories.accountTransactions.addUpdatedEventListenner(loadTimeline),
        repositories.creditCards.addUpdatedEventListenner(loadTimeline),
        repositories.creditCardsInvoices.addUpdatedEventListenner(loadTimeline),
      ];
    };

    run();

    return () => {
      active = false;
      unsubscribe.forEach((dispose) => dispose());
    };
  }, [loadTimeline, syncReferenceData]);

  function updateMonth(month: Month) {
    const params = new URLSearchParams(searchParams);
    params.set(TimelineParam.MONTH, month.key);
    params.delete(TimelineParam.TIME_MODE);
    params.delete(TimelineParam.FROM);
    params.delete(TimelineParam.TO);
    params.delete(TimelineParam.LAST_DAYS);
    params.delete(TimelineParam.RECORD_LIMIT);
    navigate(`${buildTimelinePath()}${buildTimelineSearch(params)}`);
  }

  function closeFilters() {
    navigate(`${buildTimelinePath()}${buildTimelineSearch(new URLSearchParams(searchParams))}`);
  }

  function applyFilters() {
    const params = new URLSearchParams();

    if (filterCategories.length) params.set(TimelineParam.CATEGORY, filterCategories.join(","));
    if (filterTags.length) params.set(TimelineParam.TAGS, filterTags.join(","));
    if (filterAccounts.length) params.set(FILTER_ACCOUNT_PARAM, filterAccounts.join(","));

    switch (timeFilterMode) {
      case "range":
        params.set(TimelineParam.TIME_MODE, "range");
        if (filterSince) params.set(TimelineParam.FROM, filterSince.toISOString().slice(0, 10));
        if (filterUntil) params.set(TimelineParam.TO, filterUntil.toISOString().slice(0, 10));
        break;

      case "last-days":
        params.set(TimelineParam.TIME_MODE, "last-days");
        params.set(TimelineParam.LAST_DAYS, String(filterLastDays));
        break;

      case "last-records": {
        const limit = parsePositiveInteger(filterRecordLimit);
        params.set(TimelineParam.TIME_MODE, "last-records");
        params.set(TimelineParam.RECORD_LIMIT, String(limit || 500));
        break;
      }

      case "month":
      default:
        params.set(TimelineParam.MONTH, filterMonth.key);
        break;
    }

    navigate(`${buildTimelinePath()}${buildTimelineSearch(params)}`);
  }

  function clearFilters() {
    setFilterAccounts([]);
    setTimeFilterMode("month");
    setFilterSince(undefined);
    setFilterUntil(undefined);
    setFilterLastDays(30);
    setFilterRecordLimit("500");
    setFilterCategories([]);
    setFilterTags([]);
    navigate(buildTimelinePath());
  }

  function handleNavigation(route: TimelineRoute) {
    switch (true) {
      case route instanceof ToOpenFiltersRoute: {
        const params = new URLSearchParams(searchParams);
        if (routeState.accountIds.length) params.set(FILTER_ACCOUNT_PARAM, routeState.accountIds.join(","));
        navigate(`/timeline/filters${buildTimelineSearch(params)}`);
        break;
      }

      case route instanceof ToImportRoute:
        navigate(routes.timelineImport(routeState.accountIds[0] || undefined));
        break;

      case route instanceof ToEditTransactionRoute: {
        const target = routeTargetsRef.current[route.transactionId];
        if (target) navigate(target);
        break;
      }

      case route instanceof ToExportRoute:
      case route instanceof ToStatisticsRoute:
      case route instanceof ToClearHistoryRoute:
        window.alert("Esta ação ainda não foi migrada para a nova timeline.");
        break;

      default:
        console.warn("Unknown timeline route", route);
        break;
    }
  }

  const texts: TimelineTexts = {
    title: Lang.timeline.title,
    subtitle: Lang.timeline.subtitle,
    searchPlaceholder: Lang.timeline.searchPlaceholder,
    compactViewTitle: Lang.timeline.compactViewTitle,
    filtersButtonTitle: Lang.timeline.filtersButtonTitle,
    importTransactionsLabel: Lang.timeline.importOfx,
    exportTransactionsLabel: Lang.timeline.exportTransactionsLabel,
    statisticsLabel: Lang.timeline.statisticsLabel,
    clearHistoryLabel: Lang.timeline.clearHistoryLabel,
    summaryIncomeLabel: Lang.timeline.summaryIncomeLabel,
    summaryExpenseLabel: Lang.timeline.summaryExpenseLabel,
    summaryBalanceLabel: Lang.timeline.summaryBalanceLabel,
    filtersTitle: Lang.timeline.filtersTitle,
    filtersTimeLabel: Lang.timeline.filtersTimeLabel,
    filtersAccountLabel: Lang.registry.account,
    filtersSinceLabel: Lang.timeline.filtersSinceLabel,
    filtersUntilLabel: Lang.timeline.filtersUntilLabel,
    filtersCategoriesLabel: Lang.timeline.filtersCategoriesLabel,
    filtersTagsLabel: Lang.timeline.filtersTagsLabel,
    timeModeMonthLabel: Lang.timeline.timeModeMonthLabel,
    timeModeRangeLabel: Lang.timeline.timeModeRangeLabel,
    timeModeLastDaysLabel: Lang.timeline.timeModeLastDaysLabel,
    timeModeLastRecordsLabel: Lang.timeline.timeModeLastRecordsLabel,
    timePreset30DaysLabel: Lang.timeline.timePreset30DaysLabel,
    timePreset90DaysLabel: Lang.timeline.timePreset90DaysLabel,
    timePreset180DaysLabel: Lang.timeline.timePreset180DaysLabel,
    recordsLimitLabel: Lang.timeline.recordsLimitLabel,
    recordsLimitPlaceholder: Lang.timeline.recordsLimitPlaceholder,
    recordsLimitWarning: Lang.timeline.recordsLimitWarning,
    lastDaysLabel: Lang.timeline.lastDaysLabel,
    lastRecordsLabel: Lang.timeline.lastRecordsLabel,
    selectAccountPlaceholder: Lang.timeline.selectAccountPlaceholder,
    selectDatePlaceholder: Lang.timeline.selectDatePlaceholder,
    selectCategoriesPlaceholder: Lang.timeline.selectCategoriesPlaceholder,
    selectTagsPlaceholder: Lang.timeline.selectTagsPlaceholder,
    clearFiltersLabel: Lang.timeline.clearFiltersLabel,
    applyFiltersLabel: Lang.timeline.applyFiltersLabel,
  };

  const filterMonthPeriod = getServices().timeline.period.getMonthPeriod(filterMonth);

  return {
    navigate: handleNavigation,
    texts,
    locale,
    isCompact,
    toggleCompact: () => setIsCompact((value) => !value),
    hasActiveFilters,
    isTimeRangeFilterActive,
    monthKey: routeState.month.key,
    monthLabel: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(routeState.period?.start || new Date()),
    monthRange: (() => {
      switch (routeState.timeMode) {
        case "range":
          return routeState.period
            ? `${routeState.period.start.toLocaleDateString(locale)} - ${routeState.period.end.toLocaleDateString(locale)}`
            : "";
        case "last-days":
          return texts.lastDaysLabel(routeState.lastDays || 30);
        case "last-records":
          return texts.lastRecordsLabel(routeState.recordLimit || 500);
        case "month":
        default:
          return routeState.period
            ? `${routeState.period.start.toLocaleDateString(locale)} - ${routeState.period.end.toLocaleDateString(locale)}`
            : "";
      }
    })(),
    goToPreviousMonth: () => updateMonth(routeState.month.minusOneMonth()),
    goToNextMonth: () => updateMonth(routeState.month.plusOneMonth()),
    isSearchOpen,
    toggleSearch: () => setIsSearchOpen((value) => !value),
    timelineData,
    summary,
    searchText,
    setSearchText,
    isFilterModalOpen,
    closeFilters,
    filterAccounts,
    setFilterAccounts,
    timeFilterMode,
    setTimeFilterMode,
    filterMonthLabel: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(filterMonthPeriod.start),
    filterMonthRange: `${filterMonthPeriod.start.toLocaleDateString(locale)} - ${filterMonthPeriod.end.toLocaleDateString(locale)}`,
    goToPreviousFilterMonth: () => setFilterMonth((value) => value.minusOneMonth()),
    goToNextFilterMonth: () => setFilterMonth((value) => value.plusOneMonth()),
    filterSince,
    setFilterSince,
    filterUntil,
    setFilterUntil,
    filterLastDays,
    setFilterLastDays,
    filterRecordLimit,
    setFilterRecordLimit,
    shouldShowRecordLimitWarning: parsePositiveInteger(filterRecordLimit) !== undefined && Number.parseInt(filterRecordLimit, 10) > RECORD_WARNING_THRESHOLD,
    filterCategories,
    setFilterCategories,
    filterTags,
    setFilterTags,
    accountOptions,
    categoryOptions,
    tagOptions,
    applyFilters,
    clearFilters,
  };
}
