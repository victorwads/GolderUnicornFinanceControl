import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'

export interface ICardRegistry {
  id: string,
  cardId: string,
  value: number,
  description: string,
  month: number, year: number, date: Date,
  tags?: string[],
  categoryId?: string,
  observation?: string,
  importInfo?: string
}

export default class CreditCardRegistry implements ICardRegistry {
  constructor(
    public id: string,
    public cardId: string,
    public value: number,
    public description: string,
    public month: number, public year: number, public date: Date,
    public tags: string[] = [],
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
        data.tags ?? [],
        data.categoryId,
        data.observation,
        data.importInfo
      );
    },
  };
}