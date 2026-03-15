import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  switch (brand.trim().toLowerCase()) {
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

function getBrandLogoUrl(brand: string): string | undefined {
  const normalizedBrand = brand.trim().toLowerCase();
  switch (normalizedBrand) {
    case "american express":
      return "amex.png";
    case "diners club":
      return "diners.png";
    default:
      return normalizedBrand ? `${normalizedBrand}.png` : undefined;
  }
}

function toVisualCreditCards(): CreditCard[] {
  return getRepositories()
    .creditCards
    .getCache()
    .map((card) => ({
      id: String(card.id),
      name: card.name,
      brand: card.brand,
      brandLogoUrl: getBrandLogoUrl(card.brand),
      limit: card.limit,
      color: getBrandColor(card.brand),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function useCreditCardsListModel(): CreditCardsListViewModel {
  const router = useNavigate();
  const { id } = useParams<{ id?: string }>();
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
    selectedCreditCardId: id,
  };
}
