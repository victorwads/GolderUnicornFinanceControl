import AccountsList from "@layouts/accounts/AccountsList";
import { useAccountsListModel } from "./AccountsList.model";

export default function AccountsListPage() {
  const model = useAccountsListModel();
  return <AccountsList model={model} />;
}
