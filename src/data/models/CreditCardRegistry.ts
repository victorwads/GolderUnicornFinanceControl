import DocumentModel from "./DocumentModel";

export default class CreditCardRegistry extends DocumentModel {
  constructor(
    public id: string,
    public cardId: string,
    public value: number,
    public description: string,
    public month: number, public year: number, public date: Date,
    public tags: string[] = [],
    public categoryId?: string,
    public observation?: string,
    public importInfo?: any
  ) { 
    super(id);
  }
}