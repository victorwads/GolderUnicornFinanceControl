import DocumentModel from './DocumentModel';

export enum AccountType {
    CURRENT = "CURRENT",
    SAVINGS = "SAVINGS",
    INVESTMENT = "INVESTMENT",
    CASH = "CASH",
}

export default class Account extends DocumentModel {
    constructor(
        public id: string,
        public name: string,
        public initialBalance: number,
        public bankId: string,
        public type: AccountType,
        public archived: boolean = false,
        public color?: string,
        public includeInTotal: boolean = false
    ) {
        super(id);
    }
}
