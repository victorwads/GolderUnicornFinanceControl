import CreditCard from "../models/CreditCard";
import CreditCardInvoice from "../models/CreditCardInvoice";
import Registry, { RegistryType } from "../models/Registry";

export default class InvoiceRegistry extends Registry {

  static categoryId = "fatura";
  public cardId: string;
  public accountId: string;

  constructor(
    invoice: CreditCardInvoice,
    card: CreditCard
) {
    super(
      'invoice' + invoice.id, RegistryType.INVOICE, true, invoice.value * -1,
      `Pagamento de fatura - ${card.name}`,
      invoice.paymentDate, [], InvoiceRegistry.categoryId
    );
    this.cardId = card.id;
    this.accountId = invoice.paymentAccountId;
  }
}