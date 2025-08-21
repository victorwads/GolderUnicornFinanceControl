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
    public purchaseDate?: Date,
    public location?: string,
    public toBuy: boolean = false,
    public removed: boolean = false
  ) {
    super(id);
  }

  static fromObject(obj: Partial<GroceryItemModel>): GroceryItemModel {
    if (!obj.id || !obj.name) throw new Error('Invalid GroceryItemModel');

    const { id, name, quantity, opened, barcode, expirationDate, paidPrice, purchaseDate, location, toBuy, removed } = obj;
    return Object.assign(
      new GroceryItemModel(id, name),
      { quantity, opened, barcode, expirationDate, paidPrice, purchaseDate, location, toBuy, removed }
    );
  }
}