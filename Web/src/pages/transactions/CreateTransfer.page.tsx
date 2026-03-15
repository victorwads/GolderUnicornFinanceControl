import CreateTransfer from "@layouts/transactions/CreateTransfer";
import { useCreateTransferModel } from "./CreateTransfer.model";

export default function CreateTransferPage() {
  const model = useCreateTransferModel();
  return <CreateTransfer model={model} />;
}
