import { DocumentModel } from './DocumentModel';

export enum QuantityUnit {
  UNIT = 'unit',
  KG = 'kg',
  G = 'g',
  L = 'l',
  ML = 'ml',
}

export class GroceryItemModel extends DocumentModel {
  constructor(
    public id: string,
    public name: string,
    public quantity: number = 1,
    public unit: QuantityUnit = QuantityUnit.UNIT,
    public barcode?: string,
    public expirationDate?: Date,
    public paidPrice?: number,
    public purchaseDate: Date = new Date(),
    public location?: string,
  ) {
    super(id);
  }
}
