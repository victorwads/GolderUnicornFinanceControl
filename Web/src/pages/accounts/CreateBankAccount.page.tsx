import CreateBankAccount from "@layouts/accounts/CreateBankAccount";
import { useCreateBankAccountModel } from "./CreateBankAccount.model";

export default function CreateBankAccountPage() {
  const model = useCreateBankAccountModel();
  return <CreateBankAccount model={model} />;
}
