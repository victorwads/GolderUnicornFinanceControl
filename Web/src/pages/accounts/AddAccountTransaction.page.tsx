import AddAccountTransaction from "@layouts/accounts/AddAccountTransaction";
import { useAccountTransactionModel } from "./AddAccountTransaction.model";

export default function AddAccountTransactionPage() {
  const model = useAccountTransactionModel();
  return <AddAccountTransaction model={model} />;
}
