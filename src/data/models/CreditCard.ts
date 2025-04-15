import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'

export interface ICard {
  id?: string;
  name: string;
  limit: number;
  brand: string;
  accountId: string;
  closingDay: number;
  dueDay: number;
  createdAt: Date;
  updatedAt: Date;
}

export default class CreditCard implements ICard {
  constructor(
    public id: string,
    public name: string,
    public limit: number,
    public brand: string,
    public accountId: string,
    public closingDay: number,
    public dueDay: number,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }

  static firestoreConverter: FirestoreDataConverter<CreditCard> = {
    toFirestore(card: CreditCard): DocumentData {
      const data = { ...card } as any;
      delete data.id;
      return data;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): CreditCard {
      const data = snapshot.data(options)!;
      return new CreditCard(
        snapshot.id,
        data.name,
        data.limit,
        data.brand,
        data.accountId,
        data.closingDay,
        data.dueDay,
        data.createdAt.toDate(),
        data.updatedAt.toDate()
      );
    }
  };
}