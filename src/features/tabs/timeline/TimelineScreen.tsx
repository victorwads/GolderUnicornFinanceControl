import "./TimelineScreen.css";
import { useEffect, useState } from "react";

import AccountsRegistry from "../../../data/models/AccountRegistry";
import CategoriesRepository from "../../../data/repositories/CategoriesRepository";
import AccountsRepository from "../../../data/repositories/AccountsRepository";
import Category from "../../../data/models/Category";
import Account from "../../../data/models/Account";

const formatNumber = (number: number) => number.toLocaleString(navigator.language, {
  style: "currency",
  currency: "BRL",
});

interface WithInfoRegistry extends AccountsRegistry {
  category?: Category;
  account?: Account;
}

const TimelineScreen = () => {
  const [registries, setRegistries] = useState<WithInfoRegistry[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const registries = new AccountsRepository();
    const categories = new CategoriesRepository();
    const accounts = new AccountsRepository();

    (async () => {
      await registries.waitInit();
      await categories.waitInit();
      await accounts.waitInit();

      const all = registries.getAccountItems();
      const totalValue = all.reduce((acc, registry) => acc + registry.value, 0);
      setTotal(totalValue);
      setRegistries(all.map((registry) => {
        return {
          ...registry,
          category: categories.getLocalById(registry.categoryId),
          account: accounts.getLocalById(registry.accountId)!,
        };
      }));
    })();
  }, []);

  let perDayTotal = total;
  let currentDay = registries[0]?.date.getDate();
  return (
    <div className="Screen">
      <div className="ScreenHeader">
        <h1>Timeline</h1>
        <div className="ScreenTotal">
          <span>Total:</span>
          <span className={`TotalValue ${total >= 0 ? "positive" : "negative"}`}>
            {formatNumber(total)}
          </span>
        </div>
      </div>
      <h1>Timeline</h1>
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
              {registry.id}
              <div className="TimelineDescription">{registry.description}</div>
              <div className="TimelineDetails">
                <span className="TimelineDate">{registry.date.toLocaleDateString()}</span>
                {registry.categoryId && <span className="TimelineCategoryName">{registry.category?.name}</span>}
                {registry.account && <span className="TimelineBankName">{registry.account.name}</span>}
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
      </div>
    </div>
  );
};


export default TimelineScreen;