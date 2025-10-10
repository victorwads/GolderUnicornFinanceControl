export abstract class DocumentModel {

    public _createdAt: Date = new Date();
    public _updatedAt: Date = new Date();
    public _deletedAt?: Date;

    constructor(public id: string) {}
}
