import RepositoryWithCrypt from './RepositoryWithCrypt';

import { Collections } from '../../data/firebase/Collections'
import { RegistryWithDetails } from '../models/Registry';
import CreditCardInvoicesRepository from './CreditCardsInvoicesRepository';
import AccountsRegistryRepository from './AccountsRegistryRepository';
import CreditcardsRepository from './CreditCardsRepository';
import CategoriesRepository from './CategoriesRepository';
import InvoiceRegistry from '../models/InvoiceRegistry';
import Account from '../models/Account'

export default class AccountsRepository extends RepositoryWithCrypt<Account> {

  private registries: AccountsRegistryRepository = new AccountsRegistryRepository();
  private invoices: CreditCardInvoicesRepository = new CreditCardInvoicesRepository();
  private cards: CreditcardsRepository = new CreditcardsRepository();
  private categories = new CategoriesRepository();
  private static balanceCache: { [key: string]: number } = {};

  constructor() {
    super(`${Collections.Users}/{userId}/${Collections.Accounts}`, Account);
  }

  public async waitItems(): Promise<void> {
    await this.cards.waitInit();
    await this.categories.waitInit();
    await this.registries.waitInit();
    await this.invoices.waitInit();
    await super.waitInit();
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
    const now = new Date();
    const accountRegistries = this.registries.getCache()
      .filter(registry => accountId
          ? registry.accountId === accountId
          : showArchived || !this.getLocalById(registry.accountId)?.archived
      )
      .map<RegistryWithDetails>((registry) => ({
        registry,
        category: this.categories.getLocalById(registry.categoryId),
        sourceName: this.getLocalById(registry.accountId)?.name || 'Unknown Source',
      }));

    const invoices = this.invoices.getCache()
      .filter(registry => !accountId || registry.paymentAccountId === accountId)
      .map<RegistryWithDetails>((invoice) => ({
        registry: new InvoiceRegistry(invoice, this.cards.getLocalById(invoice.cardId)!),
        category: this.categories.getLocalById(InvoiceRegistry.categoryId),
        sourceName: this.getLocalById(invoice.paymentAccountId)?.name || 'Unknown Source',
      }));

    const registries = ([...accountRegistries, ...invoices])
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