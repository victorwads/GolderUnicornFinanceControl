import RepositoryWithCrypt from './RepositoryWithCrypt';
import { Collections } from '../firebase/Collections';
import { GroceryItemModel } from '@models';

export default class GroceriesRepository extends RepositoryWithCrypt<GroceryItemModel> {
  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.Groceries}`, GroceryItemModel);
  }

  public getAllSorted(): GroceryItemModel[] {
    return this.getCache().sort((a, b) => {
      const aDate = a.expirationDate ? a.expirationDate.getTime() : 0;
      const bDate = b.expirationDate ? b.expirationDate.getTime() : 0;
      return aDate - bDate;
    });
  }
}
