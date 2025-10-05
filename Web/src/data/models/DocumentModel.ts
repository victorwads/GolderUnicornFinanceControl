export abstract class DocumentModel {

    public _createdAt: Date = new Date();
    public _updatedAt: Date = new Date();
    private _deletedAt?: Date;

    constructor(public id: string) {}

    public get isDeleted(): boolean {
        return !!this._deletedAt;
    }
}
