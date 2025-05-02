import "./TimelineScreen.css";
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from "react";

import Bank from "../../../data/models/Bank";
import Account from "../../../data/models/Account";
import Category from "../../../data/models/Category";
import BanksRepository from "../../../data/repositories/BanksRepository";
import AccountsRegistry from "../../../data/models/AccountRegistry";
import CategoriesRepository from "../../../data/repositories/CategoriesRepository";
import AccountsRepository from "../../../data/repositories/AccountsRepository";

const formatNumber = (number: number) => number.toLocaleString(navigator.language, {
  style: "currency",
  currency: "BRL",
});

interface WithInfoRegistry extends AccountsRegistry {
  category?: Category;
  account: Account;
}

const TimelineScreen = () => {
  const [showArchived, setShowArchived] = useState(false)
  const [registries, setRegistries] = useState<WithInfoRegistry[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank|null>(null);
  const [total, setTotal] = useState(0);
  const params = useParams<{ id?: string }>();

  useEffect(() => {
    const registries = new AccountsRepository();
    const categories = new CategoriesRepository();
    const accounts = new AccountsRepository();
    const banks = new BanksRepository();

    (async () => {
      await registries.waitInit();
      await categories.waitInit();
      await accounts.waitInit();
      await banks.waitInit();

      if(params.id) {
        setSelectedBank(
          banks.getLocalById(accounts.getLocalById(params.id)?.bankId ?? "") ?? null
        );
      }
      setTotal(registries.getAccountBalance(params.id, showArchived));
      setRegistries(registries.getAccountItems(params.id, showArchived).map((registry) => {
        return {
          ...registry,
          category: categories.getLocalById(registry.categoryId),
          account: accounts.getLocalById(registry.accountId)!,
        };
      }));
    })();
  }, [params.id, showArchived]);

  let perDayTotal = total;
  let currentDay = registries[0]?.date.getDate();
  return (
    <div className="Screen">
      <div className="ScreenHeader">
        <h1>Timeline{selectedBank ? ` - ${selectedBank.name}` : ''}</h1>
        <div className="ScreenTotal">
          <span>Total:</span>
          <span className={`TotalValue ${total >= 0 ? "positive" : "negative"}`}>
            {formatNumber(total)}
          </span>
        </div>
        <div>
            <span onClick={() => setShowArchived(!showArchived)}><input type="checkbox" checked={showArchived} /> Show archived</span>
        </div>
      </div>
      <div className="TimelineList">
        {registries.map((registry) => {
          const isCurrentDay = registry.date.getDate() === currentDay;
          if (!isCurrentDay) {
            currentDay = registry.date.getDate();
          }
          perDayTotal -= registry.value;
          return <>
          {/* Renderiza o item da linha do tempo */
          !isCurrentDay && <div className={`TimelineItemTodayLine ${perDayTotal >= 0 ? "positive" : "negative"}`}>
            {formatNumber(perDayTotal)}
          </div>}
          <div key={registry.id} className="TimelineItem">
            {/* Área Esquerda: Círculo com cor da categoria */}
            <div
              className="TimelineCategory"
              style={{ backgroundColor: registry.category?.color ?? "#ccc" }}
            ></div>

            {/* Área Central: Informações principais */}
            <div className="TimelineContent">
              {registry.paid.toString()}
              <div className="TimelineDescription">{registry.description}</div>
              <div className="TimelineDetails">
                <span className="TimelineDate">{registry.date.toLocaleDateString()}</span>
                {registry.categoryId && <span className="TimelineCategoryName">{registry.category?.name}</span>}
                <Link to={'/main/timeline/' + registry.accountId}>
                  <span className="TimelineBankName">{registry.account.name}</span>
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
          </>
        })}
        <div className={`TimelineItemTodayLine ${perDayTotal >= 0 ? "positive" : "negative"}`}>
          {formatNumber(perDayTotal)}
        </div>
      </div>
    </div>
  );
};


export default TimelineScreen;