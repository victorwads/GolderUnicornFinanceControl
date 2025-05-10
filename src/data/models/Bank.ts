import DocumentModel from './DocumentModel';

export default class Bank extends DocumentModel {
    constructor(
        public id: string,
        public name: string,
        public fullName: string = name,
        public logoUrl?: string
    ) {
        super(id);
    }
}

export const selectBank = new Bank("", "Selecione um banco");