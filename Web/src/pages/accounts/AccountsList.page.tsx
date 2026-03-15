import AccountsList from "@layouts/accounts/AccountsList";
import { useAccountsListModel } from "./AccountsList.model";

export default function AccountsListPage({ embedded = false }: { embedded?: boolean }) {
  const model = useAccountsListModel();
  return <AccountsList model={model} embedded={embedded} />;
}
