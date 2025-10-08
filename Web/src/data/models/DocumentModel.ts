export abstract class DocumentModel {

    public _createdAt: Date = new Date();
    public _updatedAt: Date = new Date();
    public _deletedAt?: Date;
    public isDeleted: true | undefined;

    constructor(public id: string) {
        if (this._deletedAt) {
            this.isDeleted = true;
        }
    }
}
