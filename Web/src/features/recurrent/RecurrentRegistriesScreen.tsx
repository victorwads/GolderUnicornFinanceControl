import './RecurrentRegistriesScreen.css';
import '@features/tabs/timeline/RegistryItem.css';

import { useEffect, useMemo, useState } from 'react';

import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';
import Icon, { getIconByCaseInsensitiveName } from '@components/Icons';
import { RecurrentTransaction, Category } from '@models';
import getRepositories from '@repositories';

interface RecurrentEntryView {
  registry: RecurrentTransaction;
  category?: Category;
  sourceName: string;
  sourceType: 'account' | 'creditCard';
  nextOccurrence: Date;
}

const RecurrentRegistriesScreen = () => {
  const repositories = useMemo(() => getRepositories(), []);
  const { recurrentTransactions: recurrentRegistries } = repositories;

  const [entries, setEntries] = useState<RecurrentEntryView[]>(() =>
    normalizeEntries(recurrentRegistries.getCache(), repositories)
  );

  useEffect(() => {
    const sync = () => setEntries(normalizeEntries(recurrentRegistries.getCache(), repositories));

    sync();

    return recurrentRegistries.addUpdatedEventListenner((items) => {
      setEntries(normalizeEntries(items.getCache(), repositories));
    });
  }, [recurrentRegistries, repositories]);

  const totalValue = useMemo(
    () => entries.reduce((acc, { registry }) => acc + registry.value, 0),
    [entries]
  );

  return (
    <Container screen spaced full className="RecurrentRegistriesScreen">
      <ContainerFixedContent>
        <header className="RecurrentRegistriesScreen__header">
          <h1>{Lang.recurrent.title}</h1>
          <div className="RecurrentRegistriesScreen__summary">
            <span>{Lang.timeline.registryCount}: {entries.length}</span>
            <span className={`RecurrentRegistriesScreen__total ${totalValue >= 0 ? 'positive' : 'negative'}`}>
              {totalValue.toLocaleString(CurrentLangInfo.short, {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
          </div>
        </header>
      </ContainerFixedContent>
      <ContainerScrollContent>
        {entries.length === 0 ? (
          <div className="RecurrentRegistriesScreen__empty">{Lang.recurrent.empty}</div>
        ) : (
          <div className="TimelineList">
            {entries.map((entry) => (
              <RecurrentRegistryItem key={entry.registry.id} entry={entry} />
            ))}
          </div>
        )}
      </ContainerScrollContent>
    </Container>
  );
};

export default RecurrentRegistriesScreen;

type NormalizeDeps = ReturnType<typeof getRepositories>;

type NormalizeItems = RecurrentEntryView[];

function normalizeEntries(items: RecurrentTransaction[], deps: NormalizeDeps): NormalizeItems {
  const { accounts, creditCards, categories } = deps;

  return [...items]
    .map((registry) => {
      const metadata = registry.recurrentMetadata;
      const sourceName = metadata.isCreditCard
        ? creditCards.getLocalById(metadata.cardId)?.name ?? Lang.creditcards.title
        : accounts.getLocalById(metadata.accountId)?.name ?? Lang.accounts.title;

      const nextOccurrence = getNextOccurrence(metadata.recurrentDay);

      const category = registry.categoryId
        ? categories.getLocalById(registry.categoryId)
        : undefined;

      return {
        registry,
        category,
        sourceName,
        sourceType: metadata.isCreditCard ? 'creditCard' : 'account',
        nextOccurrence,
      };
    })
    .sort((a, b) => a.registry.recurrentMetadata.recurrentDay - b.registry.recurrentMetadata.recurrentDay);
}

function getNextOccurrence(day: number): Date {
  const today = new Date();
  const next = new Date(today.getFullYear(), today.getMonth(), day);

  if (next < startOfDay(today)) {
    next.setMonth(next.getMonth() + 1);
  }

  return next;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const RecurrentRegistryItem = ({ entry }: { entry: RecurrentEntryView }) => {
  const { registry, category, sourceName, nextOccurrence, sourceType } = entry;
  const { recurrentDay } = registry.recurrentMetadata;

  const iconName = category?.icon ?? 'question';
  const iconColor = category?.color ?? '#888';

  const valueClass = registry.value >= 0 ? 'positive' : 'negative';

  return (
    <div className="TimelineItem">
      <div
        className="IconBall"
        style={{ backgroundColor: iconColor }}
      >
        <Icon icon={getIconByCaseInsensitiveName(iconName)} color="#fff" size="1x" />
      </div>
      <div className="TimelineContent">
        <div className="TimelineDescription">{registry.description}</div>
        <div className="TimelineDetails">
          <span className="TimelineDate">{Lang.recurrent.day}: {recurrentDay}</span>
          <span className="TimelineBankName">{sourceName}</span>
          <span>{Lang.recurrent.next}: {nextOccurrence.toLocaleDateString(CurrentLangInfo.short)}</span>
          <span>{Lang.recurrent.typeMonthly}</span>
          <span>
            {sourceType === 'creditCard'
              ? Lang.creditcards.title
              : Lang.accounts.title}
          </span>
          {category && <span>{category.name}</span>}
        </div>
        {registry.observation && (
          <div className="RecurrentRegistriesScreen__observation">
            {registry.observation}
          </div>
        )}
      </div>
      <div className={`TimelineValue ${valueClass}`}>
        {registry.formatedPrice}
      </div>
    </div>
  );
};
