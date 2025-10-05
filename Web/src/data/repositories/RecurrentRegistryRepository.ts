import RepositoryWithCrypt from './RepositoryWithCrypt';
import { Collections } from "../firebase/Collections";
import { AccountRecurrentRegistry } from '@models';

export default class RecurrentRegistryRepository extends RepositoryWithCrypt<AccountRecurrentRegistry> {
  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.RecurrentRegistries}`, AccountRecurrentRegistry);
  }

  public async addRegistry(registry: AccountRecurrentRegistry): Promise<void> {
    registry.id = "";
    await this.set(registry);
  }

  public async editRegistry(registry: AccountRecurrentRegistry): Promise<void> {
    await this.set(registry, true);
  }
}
