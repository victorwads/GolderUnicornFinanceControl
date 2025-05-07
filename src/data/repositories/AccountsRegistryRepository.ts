import RepositoryWithCrypt from './RepositoryWithCrypt';

import { Collections } from "../firebase/Collections";
import AccountsRegistry from '../models/AccountRegistry';

export default class AccountsRegistryRepository extends RepositoryWithCrypt<AccountsRegistry> {
  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.AccountsRegistries}`, AccountsRegistry);
  }
}
