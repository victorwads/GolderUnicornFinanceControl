import AddCreditCardTransaction from "@layouts/credit-cards/AddCreditCardTransaction";
import { useAddCreditCardTransactionModel } from "./AddCreditCardTransaction.model";

export default function AddCreditCardTransactionPage() {
  const model = useAddCreditCardTransactionModel();
  return <AddCreditCardTransaction model={model} />;
}
