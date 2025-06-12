import { DocumentModel } from "./DocumentModel";

export class CreditCard extends DocumentModel {
  constructor(
    public id: string,
    public name: string,
    public limit: number,
    public brand: string,
    public accountId: string,
    public closingDay: number,
    public dueDay: number,
    public archived: boolean = false,
    public importInfo?: any
  ) { 
    super(id);
  }
}