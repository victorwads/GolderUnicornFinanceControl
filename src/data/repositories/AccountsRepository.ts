import BaseRepository from './Repository';

import Account from '../models/Account'
import AccountsRegistry from '../models/AccountRegistry';
import { Collections } from '../../data/firebase/Collections'

import CreditcardsRepository from './CreditCardsRepository';
import AccountsRegistryRepository from './AccountsRegistryRepository';
import CreditCardInvoicesRepository from './CreditCardsInvoicesRepository';

export default class AccountsRepository extends BaseRepository<Account> {

    protected cacheDuration = 24 * 60 * 60 * 1000;
    private registries: AccountsRegistryRepository;
    private invoices: CreditCardInvoicesRepository;
    private cards: CreditcardsRepository;

    constructor() {
        super(`${Collections.Users}/{userId}/${Collections.Accounts}`, Account.firestoreConverter, true);
        this.registries = new AccountsRegistryRepository();
        this.invoices = new CreditCardInvoicesRepository();
        this.cards = new CreditcardsRepository();
    }

    public async waitInit(): Promise<void> {
        await this.registries.waitInit();
        await this.invoices.waitInit();
        await this.cards.waitInit();
        super.waitInit();
    }

    public getAccountBalance(accountId?: string): number {
        return this.getAccountItems(accountId).reduce((acc, item) =>
            item.paid ? acc + item.value : acc,
            this.getLocalById(accountId)?.initialBalance ?? 0
        );
    }

    public getAccountItems(accountId?: string): AccountsRegistry[] {
        const registries = this.registries.getCache()
            .filter(registry => !accountId || registry.accountId === accountId);
        const invoices = this.invoices.getCache()
            .filter(registry => !accountId || this.cards.getLocalById(registry.cardId)?.accountId === accountId);;

        invoices.forEach((invoice) => {
            const invoiceRegistry = new AccountsRegistry(
                'invoice-' + invoice.id,
                this.cards.getLocalById(invoice.cardId)?.accountId ?? "",
                invoice.paidValue * -1,
                `Pagamento de fatura - ${this.cards.getLocalById(invoice.cardId)?.name}`,
                new Date(invoice.paymentDate),
                true
            );
            registries.push(invoiceRegistry);
        });

        const now = new Date();
        const sortedData = registries
            .filter((registry) => registry.date.getTime() <= now.getTime())
            .sort((a, b) => b.date.getTime() - a.date.getTime());

        return sortedData;
    }
}