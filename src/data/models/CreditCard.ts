import DocumentModel from "./DocumentModel";

export default class CreditCard extends DocumentModel {
  constructor(
    public id: string,
    public name: string,
    public limit: number,
    public brand: string,
    public accountId: string,
    public closingDay: number,
    public dueDay: number,
    public archived: boolean = false,
    public importInfo?: any,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) { 
    super(id);
  }
}