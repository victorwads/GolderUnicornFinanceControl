import { CreditCard, CreditCardInvoice, InvoiceTransaction, RegistryWithDetails } from "@models";
import { Repositories } from "@repositories";
import { getCurrentUser } from '../firebase/google-services';
import { AccountsRegistry } from '../models/AccountRegistry';
import FinancialMonthPeriod from "../utils/FinancialMonthPeriod";
import searchScore from "../utils/SearchScore";

export interface TimelineFilterPeriod {
  start: Date;
  end: Date;
}

export interface TimelineFilterParams {
  period?: TimelineFilterPeriod;
  categoryIds?: string[];
  showArchived?: boolean;
  accountIds?: string[];
  paid?: boolean;
  light?: boolean;
  search?: string;
}

export default class TimelineService {

  constructor(
    private repositories: Repositories,
    public readonly period = new FinancialMonthPeriod(1)
  ) {}

  public getFirstRegistryDate(): Date {
    const accountsRegistry = this.repositories.accountTransactions.firstRegistryDate;
    const invoicesRegistry = new Date() // this.repositories.creditCardsInvoices.firstRegistryDate;
    return accountsRegistry < invoicesRegistry ? accountsRegistry : invoicesRegistry;
  }

  public getAccountItems({
    period: periodData,
    categoryIds = [],
    accountIds = [],
    showArchived = false,
    light = false,
    paid,
    search
  }: TimelineFilterParams = {}): RegistryWithDetails[] {
    const { accounts, categories, accountTransactions: accountRegistries, creditCards, creditCardsInvoices } = this.repositories;
    const period = periodData && TimelineFilterPeriodImpl.fromData(periodData);

    const debit = accountRegistries.getCache()
      .filter(r => 
        // Paid
        (paid === undefined || r.paid === paid) &&
        // Period
        (!period || period.contains(r.date)) &&
        // Categories
        (categoryIds.length === 0 || (r.categoryId && categoryIds.includes(r.categoryId))) &&
        // Accounts
        (
          (accountIds.length === 0 && (showArchived || !accounts.getLocalById(r.accountId)?.archived)) ||
          accountIds.includes(r.accountId)
        )
      )
      .map<RegistryWithDetails>((registry) => ({
        registry,
        category: light ? undefined : categories.getLocalById(registry.categoryId),
        sourceName: accounts.getLocalById(registry.accountId)?.name || 'Unknown Source',
      }));

    const credit = categoryIds.length === 0 || categoryIds.includes(InvoiceTransaction.categoryId)
      ? creditCardsInvoices.getCache()
      .filter(r => 
        // Paid
        (paid === undefined || (paid ? r.paid : !r.paid)) &&
        // Period
        (!period || period.contains(r.paymentDate || r.invoiceDate)) &&
        // Accounts
        (
          accountIds.length === 0
          ? (showArchived || !accounts.getLocalById(this.findAccountIdOfInvoice(r))?.archived)
          : (accountIds.length > 0 && accountIds.includes(this.findAccountIdOfInvoice(r)))
        )
      )
      .map<RegistryWithDetails>((invoice) => ({
        registry: new InvoiceTransaction(
          invoice, 
          light ? new CreditCard(invoice.cardId) : creditCards.getLocalById(invoice.cardId)!
        ),
        category: !light ? categories.getLocalById(InvoiceTransaction.categoryId) : undefined,
        sourceName: accounts.getLocalById(invoice.paymentAccountId)?.name || 'Unknown Source',
      }))
      : [];

    const registries = ([...debit, ...credit])
      .sort(({registry: {date: a}}, {registry: {date: b}}) => b.getTime() - a.getTime());

    return search ? this.applySearch(registries, search) : registries;
  }

  private applySearch(registries: RegistryWithDetails[], query: string): RegistryWithDetails[] {
    const trimmed = query.trim();
    if (!trimmed) return registries;

    return registries
      .map(r => ({
        item: r,
        score: searchScore(trimmed, {
          description: r.registry.description,
          name: r.sourceName,
          category: r.category?.name,
          value: r.registry.value,
        }),
      }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.item);
  }

  private findAccountIdOfInvoice({ paymentAccountId, cardId}: CreditCardInvoice): string {
    if (paymentAccountId) return paymentAccountId;

    return this.repositories.creditCards
      .getLocalById(cardId)?.accountId
      || ''
    ;
  }
}

class TimelineFilterPeriodImpl {
  constructor(
    readonly start: Date,
    readonly end: Date
  ) {}

  public contains(date?: Date): boolean {
    if (!date) return false;
    return date >= this.start && date <= this.end;
  }

  static fromData(data: TimelineFilterPeriod) {
    return new TimelineFilterPeriodImpl(data.start, data.end);
  }
}
