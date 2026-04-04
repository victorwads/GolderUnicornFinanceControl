import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import getRepositories, { waitUntilReady } from "@repositories";
import {
  RecurrentsListViewModel,
  RecurrentsRoute,
  Recurrent,
  ToCreateRecurrentRoute,
  ToEditRecurrentRoute,
  ToMoreRoute,
} from "@layouts/transactions/RecurrentsList";

function getNextOccurrence(day: number): Date {
  const today = new Date();
  const next = new Date(today.getFullYear(), today.getMonth(), day);

  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    next.setMonth(next.getMonth() + 1);
  }

  return next;
}

function toVisualRecurrents(): Recurrent[] {
  const repositories = getRepositories();

  return repositories.recurrentTransactions
    .getCache()
    .map((registry) => {
      const category = registry.categoryId
        ? repositories.categories.getLocalById(registry.categoryId)
        : undefined;
      const metadata = registry.recurrentMetadata;
      const account = metadata.isCreditCard
        ? repositories.creditCards.getLocalById(metadata.cardId)?.name
        : repositories.accounts.getLocalById(metadata.accountId)?.name;

      return {
        id: String(registry.id),
        title: registry.description,
        amount: registry.value,
        type: registry.value >= 0 ? "income" : "expense",
        frequency: "monthly",
        nextDate: getNextOccurrence(metadata.recurrentDay).toLocaleDateString(CurrentLangInfo.short),
        category: category?.name || Lang.categories.title,
        account: account || (metadata.isCreditCard ? Lang.creditcards.title : Lang.accounts.title),
        tags: registry.tags,
      };
    })
    .sort((left, right) => left.title.localeCompare(right.title));
}

export function useRecurrentsListModel(): RecurrentsListViewModel {
  const router = useNavigate();
  const [recurrents, setRecurrents] = useState<Recurrent[]>([]);

  useEffect(() => {
    let active = true;
    let dispose: (() => void) | undefined;

    const sync = () => {
      if (!active) return;
      setRecurrents(toVisualRecurrents());
    };

    const load = async () => {
      await waitUntilReady("recurrentTransactions", "accounts", "creditCards", "categories");
      if (!active) return;

      sync();
      dispose = getRepositories().recurrentTransactions.addUpdatedEventListenner(sync);
    };

    load();

    return () => {
      active = false;
      dispose?.();
    };
  }, []);

  function navigate(route: RecurrentsRoute) {
    switch (true) {
      case route instanceof ToMoreRoute:
        router("/settings");
        break;

      case route instanceof ToCreateRecurrentRoute:
        router("/recurrents/create");
        break;

      case route instanceof ToEditRecurrentRoute:
        router(`/recurrents/${route.recurrentId}`);
        break;

      default:
        console.warn("Unknown route type", route);
        break;
    }
  }

  return {
    navigate,
    recurrents,
    incomes: recurrents.filter((item) => item.type === "income"),
    expenses: recurrents.filter((item) => item.type === "expense"),
  };
}
