export default abstract class DocumentModel {

    public _createdAt: Date = new Date();
    public _updatedAt: Date = new Date();

    constructor(public id: string) {}
}
