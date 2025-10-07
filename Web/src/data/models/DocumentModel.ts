export abstract class DocumentModel {

    public _createdAt: Date = new Date();
    public _updatedAt: Date = new Date();
    public _deletedAt?: Date;
    public isDeleted: boolean;

    constructor(public id: string) {
        this.isDeleted = !!this._deletedAt;
    }
}
