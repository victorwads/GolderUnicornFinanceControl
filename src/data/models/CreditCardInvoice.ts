import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'

export interface ICreditCardInvoice {
  id?: string;
  cardId: string,
  invoiceDate: Date,
  year: number,
  month: number,
  value: number,
  paidValue: number,
  paymentDate: Date,
  paymentAccountId: string,
  importInfo?: string
}


export default class CreditCardInvoice implements ICreditCardInvoice {
  constructor(
    public id: string,
    public cardId: string,
    public invoiceDate: Date,
    public year: number,
    public month: number,
    public value: number,
    public paymentDate: Date,
    public paymentAccountId: string,
    public paidValue: number,
    public importInfo?: string
  ) { }

  static firestoreConverter: FirestoreDataConverter<CreditCardInvoice> = {
    toFirestore(invoice: CreditCardInvoice): DocumentData {
      const data = { ...invoice } as any
      delete data.id;
      return data;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): CreditCardInvoice {
      const data = snapshot.data(options)!;
      return new CreditCardInvoice(
        snapshot.id,
        data.cardId,
        data.invoiceDate.toDate(),
        data.year,
        data.month,
        data.value,
        data.paymentDate.toDate(),
        data.paymentAccountId,
        data.paidValue,
        data.importInfo
      );
    },
  };
}