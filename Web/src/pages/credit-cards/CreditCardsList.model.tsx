import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import getRepositories, { waitUntilReady } from "@repositories";
import {
  CreditCard,
  CreditCardsListViewModel,
  CreditCardsRoute,
  ToCreateCreditCardRoute,
  ToEditCreditCardRoute,
  ToMoreRoute,
} from "@layouts/credit-cards/CreditCardsList";

function getBrandColor(brand: string): string {
  switch (brand.toLowerCase()) {
    case "visa":
      return "#1a1f71";
    case "mastercard":
      return "#eb001b";
    case "american express":
      return "#006fcf";
    case "elo":
      return "#f7c600";
    case "hipercard":
      return "#b3131b";
    case "diners club":
      return "#0079be";
    default:
      return "#475569";
  }
}

function toVisualCreditCards(): CreditCard[] {
  return getRepositories()
    .creditCards
    .getCache()
    .map((card) => ({
      id: card.id as unknown as number,
      name: card.name,
      brand: card.brand,
      limit: card.limit,
      color: getBrandColor(card.brand),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function useCreditCardsListModel(): CreditCardsListViewModel {
  const router = useNavigate();
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);

  useEffect(() => {
    let active = true;
    let dispose: (() => void) | undefined;

    const sync = () => {
      if (!active) return;
      setCreditCards(toVisualCreditCards());
    };

    const load = async () => {
      await waitUntilReady("creditCards");
      if (!active) return;

      sync();
      dispose = getRepositories().creditCards.addUpdatedEventListenner(sync);
    };

    load();

    return () => {
      active = false;
      dispose?.();
    };
  }, []);

  function navigate(route: CreditCardsRoute) {
    switch (true) {
      case route instanceof ToMoreRoute:
        router("/settings");
        break;

      case route instanceof ToCreateCreditCardRoute:
        router("/creditcards/create");
        break;

      case route instanceof ToEditCreditCardRoute:
        router(`/creditcards/${route.cardId}`);
        break;

      default:
        console.warn("Unknown route type", route);
        break;
    }
  }

  return {
    navigate,
    creditCards,
  };
}
