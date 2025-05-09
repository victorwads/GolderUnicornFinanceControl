import "./TimelineScreen.css";
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from "react";

import Account from "../../../data/models/Account";
import Category from "../../../data/models/Category";
import AccountsRegistry from "../../../data/models/AccountRegistry";
import CategoriesRepository from "../../../data/repositories/CategoriesRepository";
import AccountsRepository from "../../../data/repositories/AccountsRepository";
import { Container, ContainerFixedContent } from "../../../components/conteiners";
import { ContainerScrollContent } from '../../../components/conteiners/index';
import { Loading } from "../../../components/Loading";
import Icon, { getIconByCaseInsensitiveName } from "../../../components/Icons";

const formatNumber = (number: number) => number.toLocaleString(navigator.language, {
  style: "currency",
  currency: "BRL",
});

interface WithInfoRegistry extends AccountsRegistry {
  category?: Category;
  account: Account;
}

const categoryParamName = 'c';

const TimelineScreen = () => {
  const [showArchived, setShowArchived] = useState(false)
  const [registries, setRegistries] = useState<WithInfoRegistry[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [total, setTotal] = useState(0);
  const params = useParams<{ id?: string }>();

  useEffect(() => {
    const registries = new AccountsRepository();
    const categories = new CategoriesRepository();
    const accounts = new AccountsRepository();
    const showAll = showArchived || !!params.id;

    (async () => {
      await registries.waitInit();
      await categories.waitInit();
      await accounts.waitItems();

      if (params.id) {
        setSelectedAccount(accounts.getLocalById(params.id) ?? null);
      } else {
        setSelectedAccount(null);
      }

      let items = registries.getAccountItems(params.id, showAll);
      setTotal(items.balance);
      setRegistries(items.registries.map((registry) => {
        return {
          ...registry,
          category: categories.getLocalById(registry.categoryId),
          account: accounts.getLocalById(registry.accountId)!,
        };
      }));
    })();
  }, [params.id, showArchived]);

  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaParam = searchParams.get(categoryParamName);
  const categoriaIds = categoriaParam?.split(',') ?? [];
  const hasCategoryFilter = categoriaIds.length > 0;
  let filteredRegistries = registries;
  if (hasCategoryFilter) {
    filteredRegistries = registries.filter(r => r.categoryId && categoriaIds.includes(r.categoryId));
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
  let currentDay = registries[0]?.date.getDate();
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
        {filteredRegistries.map((registry) => {
          const isCurrentDay = registry.date.getDate() === currentDay;
          if (!isCurrentDay) {
            currentDay = registry.date.getDate();
          }
          perDayTotal -= registry.value;
          return [
            !isCurrentDay && <div
              key={registry.id + 'title'}
              className={`TimelineItemTodayLine ${perDayTotal >= 0 ? "positive" : "negative"}`}
            >{formatNumber(perDayTotal)}</div>,
            <div key={registry.id} className="TimelineItem" style={{ opacity: registry.paid ? 1 : 0.7 }}>
              {/* Área Esquerda: Círculo com cor da categoria */}
              <div
                onClick={() => addCategoryFilter(registry.categoryId!)}
                className="TimelineCategory"
                style={{ backgroundColor: registry.category?.color ?? "#ccc", display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                <Icon icon={getIconByCaseInsensitiveName(registry.category?.icon ?? "question")} size="1x" color="#fff" />
              </div>

              {/* Área Central: Informações principais */}
              <div className="TimelineContent">
                <div className="TimelineDescription">{registry.description}</div>
                <div className="TimelineDetails">
                  <span className="TimelineDate">{registry.date.toLocaleDateString()}</span>
                  {registry.categoryId && <div className="TimelineCategoryName" onClick={() => addCategoryFilter(registry.categoryId!)}>
                    {registry.category?.name}
                  </div>}
                  <Link to={'/main/timeline/' + registry.accountId}>
                    <span className="TimelineBankName">{registry.account?.name}</span>
                  </Link>
                </div>
              </div>

              {/* Área Direita: Valor formatado */}
              <div
                className={`TimelineValue ${registry.value >= 0 ? "positive" : "negative"}`}
              >
                {formatNumber(registry.value)}
              </div>
            </div>
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