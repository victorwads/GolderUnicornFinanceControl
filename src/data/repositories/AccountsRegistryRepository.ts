import RepositoryWithCrypt from './RepositoryWithCrypt';

import { Collections } from "../firebase/Collections";
import AccountsRegistry from '../models/AccountRegistry';

export default class AccountsRegistryRepository extends RepositoryWithCrypt<AccountsRegistry> {
  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.AccountsRegistries}`, AccountsRegistry);
  }

  public async addRegistry(registry: AccountsRegistry): Promise<void> {
    registry.id = "";
    await this.set(registry);
  }

  public async editRegistry(registry: AccountsRegistry): Promise<void> {
    await this.set(registry, true);
  }
}
