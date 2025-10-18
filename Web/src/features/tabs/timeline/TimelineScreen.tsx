import { Link } from "react-router-dom";
import "./TimelineScreen.css";

import routes from "@features/navigate";
import { Container, ContainerFixedContent } from "@componentsDeprecated/conteiners";
import { ContainerScrollContent } from '@componentsDeprecated/conteiners';
import { Loading } from "@componentsDeprecated/Loading";
import Icon, { Icons } from '@componentsDeprecated/Icons';
import SearchBar from '@componentsDeprecated/fields/SearchBar';

import RegistryItem from "./RegistryItem";
import { useTimeline } from "./TimelineScreen.model";

const formatNumber = (number: number) => number.toLocaleString(CurrentLangInfo.short, {
  style: "currency",
  currency: "BRL",
});

const TimelineScreen = () => {
  const { 
    setShowArchived, setSearchValue, changeMonth, addCategoryFilter,
    searchValue, searchParams, showArchived, hasCategoryFilter,

    loading, registries,
    selectedAccount, categoryIds, period,
    currentBalance, currentMonth
  } = useTimeline();

  let perDayTotal = 0;
  let currentDay = registries[0]?.registry.date.getDate();

  return <>
    <Container spaced full>
    <ContainerFixedContent>
      <div className="ScreenHeaderRow">
        <h1 className="ScreenTitle">{Lang.timeline.title}</h1>
        <Loading show={loading} type="wave" />
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
        <div className="TimelineHeaderActions">
          <Link
            to={routes.timelineImport(selectedAccount?.id)}
            className="TimelineActionButton"
            aria-label={Lang.timeline.importOfx}
            title={Lang.timeline.importOfx}
          >
            <Icon icon={Icons.faFileImport} />
          </Link>
          {(() => {
            const filterParams = new URLSearchParams(searchParams);
            if (selectedAccount) filterParams.set('account', selectedAccount.id);
            const queryString = filterParams.toString();
            const filterLink = `/timeline/filters${queryString ? `?${queryString}` : ''}`;
            return (
              <Link
                to={filterLink}
                className="FilterButton TimelineActionButton"
                aria-label={Lang.timeline.filters}
                title={Lang.timeline.filters}
              >
                <Icon icon={Icons.faFilter} />
              </Link>
            );
          })()}
        </div>
      </div>
      <div className="ScreenHeaderRow">
        <div className="ScreenTotal">
          <span>{Lang.timeline.balance}:</span>
          <Loading show={loading} type="wave" />
          {<span className={`TotalValue ${currentBalance >= 0 ? "positive" : "negative"}`}>
            {formatNumber(currentBalance)}
          </span>}
        </div>
        {<span className="RegistryCount">({registries.length}) {Lang.timeline.registryCount}</span>}
      </div>
      <div className="TimelineMonthNav">
        <button className="TimelineMonthNavButton" onClick={() => changeMonth(false)}>
          <Icon icon={Icons.faChevronLeft} />
        </button>
        <div className="TimelineMonthInfo">
          <span className="TimelineMonthLabel">
            {currentMonth.localeName}
          </span>
          <span className="TimelineMonthPeriod">
            {period.start.toLocaleDateString(CurrentLangInfo.short)} - {period.end.toLocaleDateString(CurrentLangInfo.short)}
          </span>
        </div>
        <button className="TimelineMonthNavButton" onClick={() => changeMonth(true)}>
          <Icon icon={Icons.faChevronRight} />
        </button>
      </div>
      <SearchBar value={searchValue} onSearchEach={setSearchValue} onClose={() => setSearchValue('')} />
      <div className="FloatButton">
        <Link to={'/accounts/registry/add?'
          + (selectedAccount ? `&account=${selectedAccount.id}` : '')
          + (categoryIds.length === 1 ? `&category=${categoryIds[0]}` : '')
        }>
          <Icon icon={Icons.faPlus} size="2x" />
        </Link>
      </div>
    </ContainerFixedContent>
    <ContainerScrollContent>
      <div className="TimelineList">
        {registries.map(item => {
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
    </Container>
  </>;
};


export default TimelineScreen;
