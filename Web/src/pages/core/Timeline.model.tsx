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

type RouteState = {
  accountId: string;
  month: Month;
  period: { start: Date; end: Date };
  filterSince?: Date;
  filterUntil?: Date;
  categoryIds: string[];
  tags: string[];
};

function parseOptionalDate(value: string | null): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
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
  const [filterAccount, setFilterAccount] = useState("");
  const [filterSince, setFilterSince] = useState<Date | undefined>();
  const [filterUntil, setFilterUntil] = useState<Date | undefined>();
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

    try {
      fallbackPeriod = getServices().timeline.period;
    } catch {
      // The timeline route can render before repositories bootstrap on refresh.
    }

    const monthParam = searchParams.get(TimelineParam.MONTH);
    const since = parseOptionalDate(searchParams.get(TimelineParam.FROM));
    const until = parseOptionalDate(searchParams.get(TimelineParam.TO));
    const fallbackMonth = fallbackPeriod.getMonthForDate(new Date());
    const month = monthParam ? Month.fromKey(monthParam as MonthKey) : since ? Month.fromDate(since) : fallbackMonth;

    return {
      accountId: searchParams.get(FILTER_ACCOUNT_PARAM) || "",
      month,
      period: since && until ? { start: since, end: until } : fallbackPeriod.getMonthPeriod(month),
      filterSince: since,
      filterUntil: until,
      categoryIds: searchParams.get(TimelineParam.CATEGORY)?.split(",").filter(Boolean) ?? [],
      tags: searchParams.get(TimelineParam.TAGS)?.split(",").filter(Boolean) ?? [],
    };
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem("timeline-compact-mode", JSON.stringify(isCompact));
  }, [isCompact]);

  useEffect(() => {
    setFilterAccount(routeState.accountId);
    setFilterSince(routeState.filterSince);
    setFilterUntil(routeState.filterUntil);
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
      accountIds: routeState.accountId ? [routeState.accountId] : [],
      categoryIds: routeState.categoryIds,
      tags: routeState.tags,
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
      balance: balance.getBalance(routeState.accountId ? [routeState.accountId] : [], routeState.period.end),
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
    params.delete(TimelineParam.FROM);
    params.delete(TimelineParam.TO);
    params.delete(FILTER_ACCOUNT_PARAM);
    navigate(`${buildTimelinePath()}${buildTimelineSearch(params)}`);
  }

  function closeFilters() {
    const params = new URLSearchParams(searchParams);
    params.delete(FILTER_ACCOUNT_PARAM);
    navigate(`${buildTimelinePath()}${buildTimelineSearch(params)}`);
  }

  function applyFilters() {
    const params = new URLSearchParams();

    if (filterCategories.length) params.set(TimelineParam.CATEGORY, filterCategories.join(","));
    if (filterTags.length) params.set(TimelineParam.TAGS, filterTags.join(","));
    if (filterSince) params.set(TimelineParam.FROM, filterSince.toISOString().slice(0, 10));
    if (filterUntil) params.set(TimelineParam.TO, filterUntil.toISOString().slice(0, 10));
    if (!filterSince || !filterUntil) params.set(TimelineParam.MONTH, routeState.month.key);

    if (filterAccount) params.set(FILTER_ACCOUNT_PARAM, filterAccount);
    navigate(`${buildTimelinePath()}${buildTimelineSearch(params)}`);
  }

  function clearFilters() {
    setFilterAccount(routeState.accountId);
    setFilterSince(undefined);
    setFilterUntil(undefined);
    setFilterCategories([]);
    setFilterTags([]);
    navigate(buildTimelinePath());
  }

  function handleNavigation(route: TimelineRoute) {
    switch (true) {
      case route instanceof ToOpenFiltersRoute: {
        const params = new URLSearchParams(searchParams);
        if (routeState.accountId) params.set(FILTER_ACCOUNT_PARAM, routeState.accountId);
        navigate(`/timeline/filters${buildTimelineSearch(params)}`);
        break;
      }

      case route instanceof ToImportRoute:
        navigate(routes.timelineImport(routeState.accountId || undefined));
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
    filtersAccountLabel: Lang.registry.account,
    filtersSinceLabel: Lang.timeline.filtersSinceLabel,
    filtersUntilLabel: Lang.timeline.filtersUntilLabel,
    filtersCategoriesLabel: Lang.timeline.filtersCategoriesLabel,
    filtersTagsLabel: Lang.timeline.filtersTagsLabel,
    selectAccountPlaceholder: Lang.timeline.selectAccountPlaceholder,
    selectDatePlaceholder: Lang.timeline.selectDatePlaceholder,
    selectCategoriesPlaceholder: Lang.timeline.selectCategoriesPlaceholder,
    selectTagsPlaceholder: Lang.timeline.selectTagsPlaceholder,
    clearFiltersLabel: Lang.timeline.clearFiltersLabel,
    applyFiltersLabel: Lang.timeline.applyFiltersLabel,
  };

  return {
    navigate: handleNavigation,
    texts,
    locale,
    isCompact,
    toggleCompact: () => setIsCompact((value) => !value),
    monthKey: routeState.month.key,
    monthLabel: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(routeState.period.start),
    monthRange: `${routeState.period.start.toLocaleDateString(locale)} - ${routeState.period.end.toLocaleDateString(locale)}`,
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
    filterAccount,
    setFilterAccount,
    filterSince,
    setFilterSince,
    filterUntil,
    setFilterUntil,
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
