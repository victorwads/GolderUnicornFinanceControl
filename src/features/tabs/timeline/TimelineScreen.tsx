import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from "react";
import "./TimelineScreen.css";

import Account from "../../../data/models/Account";
import RegistryItem from "./RegistryItem";
import AccountsRepository from "../../../data/repositories/AccountsRepository";
import { Container, ContainerFixedContent } from "../../../components/conteiners";
import { ContainerScrollContent } from '../../../components/conteiners/index';
import { RegistryWithDetails } from "../../../data/models/Registry";
import { Loading } from "../../../components/Loading";

const formatNumber = (number: number) => number.toLocaleString(navigator.language, {
  style: "currency",
  currency: "BRL",
});

const categoryParamName = 'c';

const TimelineScreen = () => {
  const [showArchived, setShowArchived] = useState(false)
  const [registries, setRegistries] = useState<RegistryWithDetails[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [total, setTotal] = useState(0);
  const params = useParams<{ id?: string }>();

  useEffect(() => {
    const accounts = new AccountsRepository();
    const showAll = showArchived || !!params.id;

    accounts.waitItems().then(() => {
      if (params.id) {
        setSelectedAccount(accounts.getLocalById(params.id) ?? null);
      } else {
        setSelectedAccount(null);
      }

      let items = accounts.getAccountItems(params.id, showAll);
      setTotal(items.balance);
      setRegistries(items.registries);
    });
  }, [params.id, showArchived]);

  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaParam = searchParams.get(categoryParamName);
  const categoriaIds = categoriaParam?.split(',') ?? [];
  const hasCategoryFilter = categoriaIds.length > 0;
  let filteredRegistries = registries;
  if (hasCategoryFilter) {
    filteredRegistries = registries.filter(({registry: {categoryId}}) => categoryId && categoriaIds.includes(categoryId));
  }

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
  let currentDay = registries[0]?.registry.date.getDate();
  return <Container>
    <ContainerFixedContent>
      <div className="ScreenHeaderRow">
        <h1 className="ScreenTitle">Timeline</h1>
        <Loading show={registries.length === 0} type="wave" />
        {registries.length !== 0 && <span className="RegistryCount">({registries.length}) Registros</span>}
        <div className="spacer"></div>
        {(selectedAccount || hasCategoryFilter) && (
          <div className="SelectedBank">
            {selectedAccount && <span>{selectedAccount.name}</span>}
            <Link to={'/main/timeline'} className="ClearFilter">Mostrar todos</Link>
          </div>
        )}
      </div>
      <div className="ScreenHeaderRow">
        <div className="ScreenTotal">
          <span>Balance:</span>
          <Loading show={registries.length === 0} type="wave" />
          {registries.length !== 0 && <span className={`TotalValue ${total >= 0 ? "positive" : "negative"}`}>
            {formatNumber(total)}
          </span>}
        </div>
        {!selectedAccount && <div className="ScreenOptions">
          <label>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={() => setShowArchived(!showArchived)}
            />
            Show archived
          </label>
        </div>}
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