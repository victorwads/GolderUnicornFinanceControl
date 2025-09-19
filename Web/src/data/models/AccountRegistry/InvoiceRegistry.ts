import { CreditCard } from "../CreditCard";
import { CreditCardInvoice } from "../CreditCardInvoice";
import { Registry, RegistryType } from "./Registry";

export class InvoiceRegistry extends Registry {

  static categoryId = "fatura";
  public cardId: string;
  public accountId: string;
  public name: string;

  constructor(
    invoice: CreditCardInvoice,
    card: CreditCard
) {
    if (!invoice.paymentDate || !invoice.paymentAccountId) {
      throw new Error("InvoiceRegistry must have a payment date");
    }
    super(
      'invoice' + invoice.id, RegistryType.INVOICE, true, invoice.value * -1,
      `Fatura cartão -  ${card.name}`,
      invoice.paymentDate, [], InvoiceRegistry.categoryId
    );
    this.cardId = card.id;
    this.accountId = invoice.paymentAccountId;
    this.name = invoice.name;
  }
}
