import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import getRepositories from "@repositories";
import { getServices, TimelineFilterPeriod } from "@services";
import { Account, RegistryWithDetails } from "@models";
import { Month, MonthKey } from "@utils/FinancialMonthPeriod";

export enum TimelineParam {
  MONTH = 'monthKey',
  FROM = 'since',
  TO = 'until',
  CATEGORY = 'categoriesIds',
}

export const useTimeline = () => {
  const [period, setPeriod] = useState<TimelineFilterPeriod>(() => getServices().timeline.period.getPeriodForDate(new Date()));
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [accountIds, setAccountIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false)
  const [registries, setRegistries] = useState<RegistryWithDetails[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Month>(() => Month.fromDate(period.start));
  // @legacy
  const [selectedAccount, setSelectedAccount] = useState<Account | null>();
  const [searchValue, setSearchValue] = useState('');

  const { accounts, accountTransactions } = getRepositories();
  const load = useCallback(() => {
    const { balance, timeline } = getServices();

    if (accountIds?.length) {
      const id = accountIds[0];
      setSelectedAccount(accounts.getLocalById(id) ?? null);
    } else {
      setSelectedAccount(null);
    }

    let registries = timeline.getAccountItems({
      period: searchValue ? undefined : period,
      accountIds,
      categoryIds,
      showArchived,
      search: searchValue,
    });

    setCurrentBalance(balance.getBalance(accountIds, period.end));
    setRegistries(registries);
  }, [categoryIds, accountIds, showArchived, period, searchValue]);

  useEffect(() => {
    load();
    const subscriptions = [
      accounts.addUpdatedEventListenner(load),
      accountTransactions.addUpdatedEventListenner(load),
    ];
    return () => {
      subscriptions.forEach((un) => un())
    }
  }, [load]);

  const { accountId } = useParams<{ accountId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaParam = searchParams.get(TimelineParam.CATEGORY);
  const fromParam = searchParams.get(TimelineParam.FROM);
  const toParam = searchParams.get(TimelineParam.TO);
  const monthParam = searchParams.get(TimelineParam.MONTH);

  useEffect(() => {
    const { balance } = getServices();

    setCategoryIds((categoriaParam || '').split(',').filter(Boolean));
    setAccountIds(accountId ? [accountId] : []);

    if (fromParam && toParam) {
      const start = new Date(fromParam);
      setPeriod({
        start,
        end: new Date(toParam)
      });
      setCurrentMonth(Month.fromDate(start));
    } else if (monthParam) {
      const currentMonth = Month.fromKey(monthParam as MonthKey);
      setPeriod(balance.period.getMonthPeriod(currentMonth));
      setCurrentMonth(currentMonth);
    }
  }, [categoriaParam, accountId, fromParam, toParam, monthParam]);

  function addCategoryFilter(categoryId: string) {
    const newParams = new URLSearchParams(searchParams);
    const categoriaIds = newParams.get(TimelineParam.CATEGORY)?.split(',') ?? [];
    if (!categoriaIds.includes(categoryId)) {
      categoriaIds.push(categoryId);
    }
    newParams.set(TimelineParam.CATEGORY, categoriaIds.join(','));
    setSearchParams(newParams);
  }

  function changeMonth(add: boolean = true) {
    const newMonth = currentMonth[
      add ? 'plusOneMonth' : 'minusOneMonth'
    ]();

    const newParams = new URLSearchParams(searchParams);
    newParams.set(TimelineParam.MONTH, newMonth.key);
    newParams.delete(TimelineParam.FROM);
    newParams.delete(TimelineParam.TO);
    setSearchParams(newParams);
    setCurrentMonth(newMonth);
  }

  const hasCategoryFilter = categoryIds && categoryIds?.length > 0;

  return {
    showArchived,
    selectedAccount,
    currentBalance,
    currentMonth,
    period,
    registries,

    hasCategoryFilter,
    categoryIds,
    searchParams,
    searchValue,

    setShowArchived,
    setSearchValue,
    changeMonth,
    addCategoryFilter,
  }
}