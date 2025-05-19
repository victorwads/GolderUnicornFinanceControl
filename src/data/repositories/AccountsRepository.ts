import getRepositories from '.';
import RepositoryWithCrypt from './RepositoryWithCrypt';
import { Collections } from '../../data/firebase/Collections'

import { RegistryWithDetails } from '../models/Registry';
import InvoiceRegistry from '../models/InvoiceRegistry';
import Account from '../models/Account'

export default class AccountsRepository extends RepositoryWithCrypt<Account> {

  private static balanceCache: { [key: string]: number } = {};

  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.Accounts}`, Account);
  }

  public getAccountBalance(accountId?: string, showArchived: boolean = false): number {
    if (AccountsRepository.balanceCache[accountId || '']) {
      return AccountsRepository.balanceCache[accountId || ''];
    }
    return this.getAccountItems(accountId, showArchived).balance;
  }

  public getAccountItems(accountId?: string, showArchived: boolean = false): {
    registries: RegistryWithDetails[],
    balance: number
  } {
    const { categories, accountRegistries, creditCards, creditCardsInvoices } = getRepositories();

    const now = new Date();
    const debit = accountRegistries.getCache()
      .filter(registry => accountId
          ? registry.accountId === accountId
          : showArchived || !this.getLocalById(registry.accountId)?.archived
      )
      .map<RegistryWithDetails>((registry) => ({
        registry,
        category: categories.getLocalById(registry.categoryId),
        sourceName: this.getLocalById(registry.accountId)?.name || 'Unknown Source',
      }));

    const credit = creditCardsInvoices.getCache()
      .filter(registry => !accountId || registry.paymentAccountId === accountId)
      .map<RegistryWithDetails>((invoice) => ({
        registry: new InvoiceRegistry(invoice, creditCards.getLocalById(invoice.cardId)!),
        category: categories.getLocalById(InvoiceRegistry.categoryId),
        sourceName: this.getLocalById(invoice.paymentAccountId)?.name || 'Unknown Source',
      }));

    const registries = ([...debit, ...credit])
      .filter((item) => item.registry.date.getTime() <= now.getTime())
      .sort(({registry: {date: a}}, {registry: {date: b}}) => b.getTime() - a.getTime());

    return {
      registries,
      balance: AccountsRepository.balanceCache[accountId || ''] = registries.reduce((acc, item) =>
        item.registry.paid ? acc + item.registry.value : acc,
        this.getLocalById(accountId)?.initialBalance ?? 0
      )
    };
  }
}
