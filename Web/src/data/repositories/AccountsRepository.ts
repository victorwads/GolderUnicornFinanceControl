import getRepositories from '.';
import RepositoryWithCrypt from './RepositoryWithCrypt';
import { Collections } from '../../data/firebase/Collections'

import { Account, Bank, WithInfoAccount } from '@models';

export default class AccountsRepository extends RepositoryWithCrypt<Account> {

  constructor() {
    super(
      "Account",
      `${Collections.Users}/{userId}/${Collections.Accounts}`,
      Account,
    );
  }

  public getCacheWithBank(showArchived: boolean|null = false): WithInfoAccount[] {
    const { banks } = getRepositories();
    return super.getCache()
      .filter(account => showArchived || !account.archived)
      .map(account => {
      const bank = banks.getLocalById(account.bankId);
      return {
        ...account,
        bank: new Bank(
          account.bankId,
          bank?.name || account.name,
          bank?.fullName || bank?.name || account.name,
          bank?.logoUrl
        )
      }
    });
  }
}
