import DocumentModel from './DocumentModel';

export default class CreditCardInvoice extends DocumentModel {
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
}
