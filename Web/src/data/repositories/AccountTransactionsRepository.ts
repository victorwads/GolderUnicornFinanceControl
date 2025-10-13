import RepositoryWithCrypt from './RepositoryWithCrypt';

import { Collections } from "../firebase/Collections";
import { AccountsRegistry as AccountTransaction } from '@models';

export default class AccountTransactionsRepository extends RepositoryWithCrypt<AccountTransaction> {
  constructor() {
    super(
      "Account Registry",
      `${Collections.Users}/{userId}/${Collections.AccountsRegistries}`,
       AccountTransaction,
      );
  }

  private _firstRegistryDate: Date = new Date();

  protected override addToCache(model: AccountTransaction): void {
      if ( model.date && model.date < this._firstRegistryDate) {
        this._firstRegistryDate = model.date;
      }
      super.addToCache(model);
  }

  public get firstRegistryDate(): Date {
    return this._firstRegistryDate;
  }
}
