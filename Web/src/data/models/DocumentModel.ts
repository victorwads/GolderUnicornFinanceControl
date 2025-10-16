export abstract class DocumentModel {

    public _createdAt: Date = new Date();
    public _updatedAt: Date = new Date();
    public _deletedAt?: Date;

    public name: string | undefined;
    public description: string | undefined;

    constructor(public id: string) {}
}
