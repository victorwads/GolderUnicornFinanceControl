import getRepositories from '.';
import RepositoryWithCrypt from './RepositoryWithCrypt';
import { Collections } from '../../data/firebase/Collections'

import { Account, Bank, WithInfoAccount } from '@models';

export default class AccountsRepository extends RepositoryWithCrypt<Account> {

  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.Accounts}`, Account);
  }

  public getCacheWithBank(showArchived: boolean|null = false): WithInfoAccount[] {
    const { banks } = getRepositories();
    return super.getCache()
      .filter(account => showArchived || !account.archived)
      .map(account => {
      return {
        ...account,
        bank: new Bank(
          account.bankId, account.name, '',
          banks.getLocalById(account.bankId)?.logoUrl
        )
      }
    });
  }
}
