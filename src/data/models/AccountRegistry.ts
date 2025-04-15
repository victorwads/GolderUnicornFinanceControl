import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'

export interface IAccountsRegistry {
  id: string,
  accountId: string,
  value: number,
  description: string,
  date: Date,
  categoryId?: string,
  observation?: string,
  importInfo?: any
}

export default class AccountsRegistry implements IAccountsRegistry {
  constructor(
    public id: string,
    public accountId: string,
    public value: number,
    public description: string,
    public date: Date,
    public categoryId?: string,
    public observation?: string,
    public importInfo?: any
  ) { }

  static firestoreConverter: FirestoreDataConverter<AccountsRegistry> = {
    toFirestore(registry: AccountsRegistry): DocumentData {
      const data = { ...registry } as any;
      delete data.id;
      return data;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): AccountsRegistry {
      const data = snapshot.data(options);
      return new AccountsRegistry(
        snapshot.id,
        data.accountId,
        data.value,
        data.description,
        data.date.toDate(),
        data.categoryId,
        data.observation,
        data.importInfo
      );
    },
  };
}