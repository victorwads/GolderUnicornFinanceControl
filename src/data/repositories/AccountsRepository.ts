import getRepositories from '.';
import RepositoryWithCrypt from './RepositoryWithCrypt';
import { Collections } from '../../data/firebase/Collections'

import { Account, CreditCard, InvoiceRegistry, RegistryWithDetails } from '@models';

export default class AccountsRepository extends RepositoryWithCrypt<Account> {

  private static balanceCache: { [key: string]: number } = {};

  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.Accounts}`, Account);
  }

  public getAccountBalance(accountId?: string, showArchived: boolean = false): number {
    if (AccountsRepository.balanceCache[accountId || '']) {
      return AccountsRepository.balanceCache[accountId || ''];
    }
    return this.getAccountItems(accountId, showArchived, true).balance;
  }

  public getAccountItems(accountId?: string, showArchived: boolean = false, light: boolean = false): {
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
        category: !light ? categories.getLocalById(registry.categoryId) : undefined,
        sourceName: this.getLocalById(registry.accountId)?.name || 'Unknown Source',
      }));

    const credit = creditCardsInvoices.getCache()
      .filter(registry => !accountId || registry.paymentAccountId === accountId)
      .map<RegistryWithDetails>((invoice) => ({
        registry: new InvoiceRegistry(
          invoice, 
          light ? new CreditCard(invoice.cardId) : creditCards.getLocalById(invoice.cardId)!
        ),
        category: !light ? categories.getLocalById(InvoiceRegistry.categoryId) : undefined,
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

  public getCache(showArchived: boolean = false): Account[] {
    return super.getCache().filter(account => showArchived || !account.archived);
  }
}
