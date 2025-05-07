import DocumentModel from './DocumentModel';

export default class Bank extends DocumentModel {
    constructor(
        public id: string,
        public name: string,
        public fullName: string,
        public logoUrl?: string
    ) {
        super(id);
    }
}