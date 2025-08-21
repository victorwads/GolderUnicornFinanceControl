import { DocumentModel } from "./DocumentModel";

export class CreditCard extends DocumentModel {
  constructor(
    public id: string,
    public name: string = '',
    public limit: number = 0,
    public brand: string = '',
    public accountId: string = '',
    public closingDay: number = 1,
    public dueDay: number = 1,
    public archived: boolean = false,
    public importInfo?: any
  ) { 
    super(id);
  }
}