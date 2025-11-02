import DeleteAccount from "@layouts/privacy/DeleteAccount";
import { useDeleteAccountModel } from "./DeleteAccount.model";

export default function DeleteAccountPage() {
  const model = useDeleteAccountModel();
  return <DeleteAccount model={model} />;
}
