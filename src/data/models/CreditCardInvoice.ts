import { DocumentModel } from './DocumentModel';

export class CreditCardInvoice extends DocumentModel {
  constructor(
    public id: string,
    public cardId: string,
    public invoiceDate: Date,
    public year: number,
    public month: number,
    public value: number,
    public paymentDate?: Date,
    public paymentAccountId?: string,
    public paidValue?: number,
    public importInfo?: string
  ) {
    super(id);
  }

  public get name(): string {
    return CreditCardInvoice.makeName(this.year, this.month);
  }

  public static nowName(): string {
    const now = new Date();
    return CreditCardInvoice.makeName(now.getFullYear(), now.getMonth() + 1);
  }

  private static makeName(year: number, month: number): string {
    return year + String(month).padStart(2, '0');
  }
}
