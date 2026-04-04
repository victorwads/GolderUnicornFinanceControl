import RecurrentsList from "@layouts/transactions/RecurrentsList";
import { useRecurrentsListModel } from "./RecurrentsList.model";

export default function RecurrentsListPage() {
  const model = useRecurrentsListModel();
  return <RecurrentsList model={model} />;
}
