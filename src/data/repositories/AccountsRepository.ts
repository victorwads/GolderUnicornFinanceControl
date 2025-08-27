import getRepositories from '.';
import RepositoryWithCrypt from './RepositoryWithCrypt';
import { Collections } from '../../data/firebase/Collections'

import { Account, CreditCard, InvoiceRegistry, RegistryWithDetails } from '@models';

export default class AccountsRepository extends RepositoryWithCrypt<Account> {

  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.Accounts}`, Account);
  }

  public getCache(showArchived: boolean = false): Account[] {
    return super.getCache().filter(account => showArchived || !account.archived);
  }
}
