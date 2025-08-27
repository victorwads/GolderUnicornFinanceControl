import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from "react";
import "./TimelineScreen.css";

import { Month, MonthKey } from '@utils/FinancialMonthPeriod';
import { Account, RegistryWithDetails } from "@models";
import { getServices, TimelineFilterPeriod } from '@services';
import getRepositories from '@repositories';

import routes from '@features/navigate';
import { Container, ContainerFixedContent } from "@components/conteiners";
import { ContainerScrollContent } from '@components/conteiners';
import { Loading } from "@components/Loading";
import Icon from '@components/Icons';
import SearchBar from '@components/fields/SearchBar';
import searchScore from '@utils/SearchScore';

import { PARAM_CATEGORY, PARAM_FROM, PARAM_TO } from './TimelineFilterScreen';
import RegistryItem from "./RegistryItem";
import { a } from 'vitest/dist/chunks/suite.d.FvehnV49';

const formatNumber = (number: number) => number.toLocaleString(navigator.language, {
  style: "currency",
  currency: "BRL",
});

const PARAM_MONTH = 'm';

const TimelineScreen = () => {
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

  useEffect(() => {
    const { accounts } = getRepositories();
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
      showArchived
    });

    setCurrentBalance(balance.getBalance(accountIds, period.end));
    setRegistries(registries);
  }, [categoryIds, accountIds, showArchived, period, searchValue]);

  const displayedRegistries = useMemo(() => {
    if (!searchValue.trim()) return registries;
    return registries
      .map(r => ({
        item: r,
        score: searchScore(searchValue, {
          description: r.registry.description,
          name: r.sourceName,
          category: r.category?.name,
          value: r.registry.value,
        })
      }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.item);
  }, [searchValue, registries]);

  const { id: accountId} = useParams<{ id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaParam = searchParams.get(PARAM_CATEGORY);
  const fromParam = searchParams.get(PARAM_FROM);
  const toParam = searchParams.get(PARAM_TO);
  const monthParam = searchParams.get(PARAM_MONTH);

  useEffect(() => {
    const { balance } = getServices();

    setCategoryIds((categoriaParam || '').split(',').filter(Boolean));
    setAccountIds(accountId ? [accountId] : []);

    if (fromParam && toParam) {
      setPeriod({
        start: new Date(fromParam),
        end: new Date(toParam)
      });
    } else if (monthParam) {
      setPeriod(balance.period.getMonthPeriod(
        Month.fromKey(monthParam as MonthKey)
      ));
    }
  }, [categoriaParam, accountId, fromParam, toParam, monthParam]);

  function addCategoryFilter(categoryId: string) {
    const newParams = new URLSearchParams(searchParams);
    const categoriaIds = newParams.get(PARAM_CATEGORY)?.split(',') ?? [];
    if (!categoriaIds.includes(categoryId)) {
      categoriaIds.push(categoryId);
    }
    newParams.set(PARAM_CATEGORY, categoriaIds.join(','));
    setSearchParams(newParams);
  }

  function changeMonth(add: boolean = true) {
    const newMonth = currentMonth[
      add ? 'plusOneMonth' : 'minusOneMonth'
    ]();

    const newParams = new URLSearchParams(searchParams);
    newParams.set(PARAM_MONTH, newMonth.key);
    newParams.delete(PARAM_FROM);
    newParams.delete(PARAM_TO);
    setSearchParams(newParams);
    setCurrentMonth(newMonth);
  }

  const hasCategoryFilter = categoryIds && categoryIds?.length > 0;

  // TODO
  let perDayTotal = 0;
  let currentDay = displayedRegistries[0]?.registry.date.getDate();
  return <Container spaced full>
    <ContainerFixedContent>
      <div className="ScreenHeaderRow">
        <h1 className="ScreenTitle">{Lang.timeline.title}</h1>
        <Loading show={registries.length === 0} type="wave" />
        <div className="spacer"></div>
        {(selectedAccount || hasCategoryFilter) && (
          <div className="SelectedBank">
            {selectedAccount && <span>{selectedAccount.name}</span>}
            <Link to={routes.timeline()} className="ClearFilter">{Lang.timeline.clearFilter}</Link>
          </div>
        )}
        {!selectedAccount && <div className="ScreenOptions">
          <label>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={() => setShowArchived(!showArchived)}
            />
            {Lang.accounts.showArchived}
          </label>
        </div>}
        {(() => {
          const filterParams = new URLSearchParams(searchParams);
          if (selectedAccount) filterParams.set('account', selectedAccount.id);
          const filterLink = `/main/timeline/filters${filterParams.toString() ? `?${filterParams.toString()}` : ''}`;
          return <Link to={filterLink} className="FilterButton"><Icon icon={Icon.all.faFilter} /></Link>;
        })()}
      </div>
      <div className="ScreenHeaderRow">
        <div className="ScreenTotal">
          <span>{Lang.timeline.balance}:</span>
          <Loading show={registries.length === 0} type="wave" />
          {registries.length !== 0 && <span className={`TotalValue ${currentBalance >= 0 ? "positive" : "negative"}`}>
            {formatNumber(currentBalance)}
          </span>}
        </div>
        {displayedRegistries.length !== 0 && <span className="RegistryCount">({displayedRegistries.length}) {Lang.timeline.registryCount}</span>}
      </div>
      <div className="TimelineMonthNav">
        <button className="TimelineMonthNavButton" onClick={() => changeMonth(false)}>
          <Icon icon={Icon.all.faChevronLeft} />
        </button>
        <span className="TimelineMonthLabel">
          {currentMonth.localeName}
        </span>
        <button className="TimelineMonthNavButton" onClick={() => changeMonth(true)}>
          <Icon icon={Icon.all.faChevronRight} />
        </button>
      </div>
      <SearchBar value={searchValue} onSearchEach={setSearchValue} onClose={() => setSearchValue('')} />
      <div className="FloatButton">
        <Link to={'/accounts/registry/add?'
          + (selectedAccount ? `&account=${selectedAccount.id}` : '')
          + (categoryIds.length === 1 ? `&category=${categoryIds[0]}` : '')
        }>
          <Icon icon={Icon.all.faPlus} size="2x" />
        </Link>
      </div>
    </ContainerFixedContent>
    <ContainerScrollContent>
      <div className="TimelineList">
        {displayedRegistries.map(item => {
          const { id, value, date } = item.registry;
          const isCurrentDay = date.getDate() === currentDay;
          if (!isCurrentDay) {
            currentDay = date.getDate();
          }
          perDayTotal -= value;
          return [
            !isCurrentDay && <div
              key={id + 'title'}
              className={`TimelineItemTodayLine ${perDayTotal >= 0 ? "positive" : "negative"}`}
            >{formatNumber(perDayTotal)}</div>,
            <RegistryItem key={id} item={item} onCategoryClick={addCategoryFilter} />
          ]
        })}
        <div className={`TimelineItemTodayLine ${perDayTotal >= 0 ? "positive" : "negative"}`}>
          {formatNumber(perDayTotal)}
        </div>
      </div>
    </ContainerScrollContent>
  </Container>;
};


export default TimelineScreen;
