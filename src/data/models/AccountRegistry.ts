import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'

export enum RegistryType {
  ACCOUNT,
  CREDIT,
  TRANSFER,
  INVOICE,
  CARD_RECURRENT,
  ACCOUNT_RECURRENT,
}

export default class AccountsRegistry {
  constructor(
    public id: string,
    public type: RegistryType,
    public accountId: string,
    public value: number,
    public description: string,
    public date: Date,
    public paid: boolean = false,
    public tags: string[] = [],
    public categoryId?: string,
    public observation?: string,
    public relatedInfo?: string
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
        data.type,
        data.accountId,
        data.value,
        data.description,
        data.date.toDate(),
        data.paid,
        data.tags ?? [],
        data.categoryId,
        data.observation,
        data.importInfo
      );
    },
  };
}