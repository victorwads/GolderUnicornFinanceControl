import InvoicesList from "@layouts/transactions/InvoicesList";
import { useInvoicesListModel } from "./InvoicesList.model";

export default function InvoicesListPage({ embedded = false }: { embedded?: boolean }) {
  const model = useInvoicesListModel();
  return <InvoicesList model={model} embedded={embedded} />;
}
