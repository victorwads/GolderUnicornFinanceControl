import { DocumentModel } from './DocumentModel';

export interface ProductPrice {
  value: number;
  date: Date;
}

export class ProductModel extends DocumentModel {
  constructor(
    public id: string,
    public name: string,
    public barcode?: string,
    public lastPrice: number = 0,
    public prices: ProductPrice[] = [],
    public shelfLife: number = 0,
    public categoryId?: string,
  ) {
    super(id);
  }
}
