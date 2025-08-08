import { DocumentModel } from './DocumentModel';

export class GroceryItemModel extends DocumentModel {
  constructor(
    public id: string,
    public name: string,
    public quantity: number = 1,
    public opened: boolean = false,
    public barcode?: string,
    public expirationDate?: Date,
    public paidPrice?: number,
    public purchaseDate: Date = new Date(),
    public location?: string,
  ) {
    super(id);
  }
}
