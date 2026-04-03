import InvoicesList from "@layouts/transactions/InvoicesList";
import { useInvoicesListModel } from "./InvoicesList.model";

export default function InvoicesListPage() {
  const model = useInvoicesListModel();
  return <InvoicesList model={model} />;
}
