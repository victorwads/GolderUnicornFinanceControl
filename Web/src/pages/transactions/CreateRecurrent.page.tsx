import CreateRecurrent from "@layouts/transactions/CreateRecurrent";
import { useCreateRecurrentModel } from "./CreateRecurrent.model";

export default function CreateRecurrentPage() {
  const model = useCreateRecurrentModel();
  return <CreateRecurrent model={model} />;
}
