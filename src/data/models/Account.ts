import  { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'

export enum AccountType {
    CURRENT = "CURRENT",
    SAVINGS = "SAVINGS",
    INVESTMENT = "INVESTMENT",
    CASH = "CASH",
}

export interface IAccount {
    id?: string;
    name: string;
    initialBalance: number;
    bankId: string;
    type: AccountType;
    color?: string;
    includeInTotal: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export default class Account implements IAccount {
    constructor(
        public id: string,
        public name: string,
        public initialBalance: number,
        public bankId: string,
        public type: AccountType,
        public color?: string,
        public includeInTotal: boolean = false,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date()
    ) {}

    static firestoreConverter: FirestoreDataConverter<Account> = {
        toFirestore(account: Account): DocumentData {
            const data = { ...account } as any;
            delete data.id;
            return data
        },
        fromFirestore(
            snapshot: QueryDocumentSnapshot,
            options: SnapshotOptions
        ): Account {
            const data = snapshot.data(options)!;
            return new Account(
                snapshot.id,
                data.name,
                data.initialBalance,
                data.bankId,
                data.type,
                data.color,
                data.includeInTotal,
                data.createdAt.toDate(),
                data.updatedAt.toDate()
            );
        }
    };
}