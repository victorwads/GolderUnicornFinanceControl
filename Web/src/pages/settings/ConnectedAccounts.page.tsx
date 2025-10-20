import { useConnectedAccountsModel } from "./ConnectedAccounts.model";
import ConnectedAccounts from "@layouts/settings/ConnectedAccounts";

export default function ConnectedAccountsPage() {
  const model = useConnectedAccountsModel();
  return <ConnectedAccounts model={model} />;
}
