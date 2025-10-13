import RepositoryWithCrypt from './RepositoryWithCrypt';
import { Collections } from '../firebase/Collections';
import { ProductModel } from '@models';

export default class GroceriesProductsRepository extends RepositoryWithCrypt<ProductModel> {
  constructor() {
    super(
      'Grocery Product',
      `${Collections.Users}/{userId}/${Collections.Products}`,
      ProductModel,
    );
  }

  public getByBarcode(barcode?: string): ProductModel | undefined {
    if (!barcode) return undefined;
    return this.getCache().find(p => p.barcode === barcode);
  }
}
