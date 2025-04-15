import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'

export interface ICard {
  id: string,
  cardId: string,
  value: number,
  description: string,
  month: string, year: number, date: Date,
  categoryId?: string,
  observation?: string,
  importInfo: any
}

export default class CreditCardRegistry {
  constructor(
    public id: string,
    public cardId: string,
    public value: number,
    public description: string,
    public month: number, public year: number, public date: Date,
    public categoryId?: string,
    public observation?: string,
    public importInfo?: any
  ) { }

  static firestoreConverter: FirestoreDataConverter<CreditCardRegistry> = {
    toFirestore(registry: CreditCardRegistry): DocumentData {
      const data = { ...registry } as any
      delete data.id;
      return data;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): CreditCardRegistry {
      const data = snapshot.data(options)!;
      return new CreditCardRegistry(
        snapshot.id,
        data.cardId,
        data.value,
        data.description,
        data.month, data.year, data.date.toDate(),
        data.categoryId,
        data.observation,
        data.importInfo
      );
    },
  };
}