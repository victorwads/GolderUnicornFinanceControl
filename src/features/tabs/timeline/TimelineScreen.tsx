import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import "./TimelineScreen.css";

import { Account, RegistryWithDetails } from "@models";
import getRepositories from '@repositories';

import { Container, ContainerFixedContent } from "@components/conteiners";
import { ContainerScrollContent } from '@components/conteiners';
import { Loading } from "@components/Loading";
import RegistryItem from "./RegistryItem";
import Icon from '@components/Icons';
import routes from '@features/navigate';

const formatNumber = (number: number) => number.toLocaleString(navigator.language, {
  style: "currency",
  currency: "BRL",
});

const categoryParamName = 'c';

const TimelineScreen = () => {
  const [showArchived, setShowArchived] = useState(false)
  const [registries, setRegistries] = useState<RegistryWithDetails[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const params = useParams<{ id?: string }>();

  useEffect(() => {
    const { accounts } = getRepositories();
    const showAll = showArchived || !!params.id;

    if (params.id) {
      setSelectedAccount(accounts.getLocalById(params.id) ?? null);
    } else {
      setSelectedAccount(null);
    }

    let items = accounts.getAccountItems(params.id, showAll);
    setRegistries(items.registries);
  }, [params.id, showArchived]);

  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaParam = searchParams.get(categoryParamName);
  const categoriaIds = categoriaParam?.split(',') ?? [];
  const hasCategoryFilter = categoriaIds.length > 0;

  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const fromDate = fromParam ? new Date(fromParam) : null;
  const toDate = toParam ? new Date(toParam) : null;

  let filteredRegistries = registries;
  if (hasCategoryFilter) {
    filteredRegistries = filteredRegistries.filter(({ registry: { categoryId } }) => categoryId && categoriaIds.includes(categoryId));
  }
  if (fromDate) {
    filteredRegistries = filteredRegistries.filter(({ registry: { date } }) => date.getTime() >= fromDate.getTime());
  }
  if (toDate) {
    filteredRegistries = filteredRegistries.filter(({ registry: { date } }) => date.getTime() <= toDate.getTime());
  }

  const total = filteredRegistries.reduce((acc, { registry }) => registry.paid ? acc + registry.value : acc, 0);

  function addCategoryFilter(categoryId: string) {
    const newParams = new URLSearchParams(searchParams);
    const categoriaIds = newParams.get(categoryParamName)?.split(',') ?? [];
    if (!categoriaIds.includes(categoryId)) {
      categoriaIds.push(categoryId);
    }
    newParams.set(categoryParamName, categoriaIds.join(','));
    setSearchParams(newParams);
  }

  let perDayTotal = total;
  let currentDay = filteredRegistries[0]?.registry.date.getDate();
  return <Container spaced full>
    <ContainerFixedContent>
      <div className="ScreenHeaderRow">
        <h1 className="ScreenTitle">{Lang.timeline.title}</h1>
        <Loading show={registries.length === 0} type="wave" />
        <div className="spacer"></div>
        {(() => {
          const filterParams = new URLSearchParams(searchParams);
          if (selectedAccount) filterParams.set('account', selectedAccount.id);
          const filterLink = `/timeline/filters${filterParams.toString() ? `?${filterParams.toString()}` : ''}`;
          return <Link to={filterLink} className="FilterButton"><Icon icon={Icon.all.faFilter} /></Link>;
        })()}
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
      </div>
      <div className="ScreenHeaderRow">
        <div className="ScreenTotal">
          <span>{Lang.timeline.balance}:</span>
          <Loading show={registries.length === 0} type="wave" />
          {registries.length !== 0 && <span className={`TotalValue ${total >= 0 ? "positive" : "negative"}`}>
            {formatNumber(total)}
          </span>}
        </div>
        {registries.length !== 0 && <span className="RegistryCount">({filteredRegistries.length}) {Lang.timeline.registryCount}</span>}
      </div>
      <div className="FloatButton">
        <Link to={'/accounts/registry/add?'
          + (selectedAccount ? `&account=${selectedAccount.id}` : '')
          + (categoriaIds.length === 1 ? `&category=${categoriaIds[0]}` : '')
        }>
          <Icon icon={Icon.all.faPlus} size="2x" />
        </Link>
      </div>
    </ContainerFixedContent>
    <ContainerScrollContent>
      <div className="TimelineList">
        {filteredRegistries.map(item => {
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
