import CreditCardsList from "@layouts/credit-cards/CreditCardsList";
import { useCreditCardsListModel } from "./CreditCardsList.model";

export default function CreditCardsListPage({ embedded = false }: { embedded?: boolean }) {
  const model = useCreditCardsListModel();
  return <CreditCardsList model={model} embedded={embedded} />;
}
