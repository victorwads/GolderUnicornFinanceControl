import  { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore'

export enum AccountType {
    CURRENT = "CURRENT",
    SAVINGS = "SAVINGS",
    CREDIT_CARD = "CREDIT_CARD",
    INVESTMENT = "INVESTMENT"
}

export interface IAccount {
    id: string;
    name: string;
    initialBalance: number;
    bankId: string;
    type: AccountType;
    color: string;
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
        public color: string,
        public includeInTotal: boolean,
        public createdAt: Date,
        public updatedAt: Date
    ) {}

    static firestoreConverter: FirestoreDataConverter<Account> = {
        toFirestore(account: Account): DocumentData {
            return {
                name: account.name,
                initialBalance: account.initialBalance,
                bankId: account.bankId,
                type: account.type,
                color: account.color,
                includeInTotal: account.includeInTotal,
                createdAt: account.createdAt,
                updatedAt: account.updatedAt
            };
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