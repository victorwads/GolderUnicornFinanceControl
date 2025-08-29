import RepositoryWithCrypt from './RepositoryWithCrypt';

import { Collections } from "../firebase/Collections";
import { AccountsRegistry } from '@models';

export default class AccountsRegistryRepository extends RepositoryWithCrypt<AccountsRegistry> {
  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.AccountsRegistries}`, AccountsRegistry);
  }

  private _firstRegistryDate: Date = new Date();

  protected override addToCache(model: AccountsRegistry): void {
      if ( model.date && model.date < this._firstRegistryDate) {
        this._firstRegistryDate = model.date;
      }
      super.addToCache(model);
  }

  public get firstRegistryDate(): Date {
    return this._firstRegistryDate;
  }

  public async addRegistry(registry: AccountsRegistry): Promise<void> {
    registry.id = "";
    await this.set(registry);
  }

  public async editRegistry(registry: AccountsRegistry): Promise<void> {
    await this.set(registry, true);
  }
}
