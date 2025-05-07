import RepositoryWithCrypt from './RepositoryWithCrypt';

import Account from '../models/Account'
import AccountsRegistry, { RegistryType } from '../models/AccountRegistry';
import { Collections } from '../../data/firebase/Collections'

import CreditcardsRepository from './CreditCardsRepository';
import AccountsRegistryRepository from './AccountsRegistryRepository';
import CreditCardInvoicesRepository from './CreditCardsInvoicesRepository';

export default class AccountsRepository extends RepositoryWithCrypt<Account> {

    private registries: AccountsRegistryRepository;
    private invoices: CreditCardInvoicesRepository;
    private cards: CreditcardsRepository;
    private static balanceCache: { [key: string]: number } = {};

    constructor() {
        super(`${Collections.Users}/{userId}/${Collections.Accounts}`, Account, true);
        this.registries = new AccountsRegistryRepository();
        this.invoices = new CreditCardInvoicesRepository();
        this.cards = new CreditcardsRepository();
    }

    public override async waitInit(): Promise<void> {
        await this.registries.waitInit();
        await this.invoices.waitInit();
        await this.cards.waitInit();
        await super.waitInit();
    }

    public getAccountBalance(accountId?: string, showArchived: boolean = false): number {
        if (AccountsRepository.balanceCache[accountId || '']) {
            return AccountsRepository.balanceCache[accountId || ''];
        }
        return this.getAccountItems(accountId, showArchived).balance;
    }

    public getAccountItems(accountId?: string, showArchived: boolean = false): {
        registries: AccountsRegistry[],
        balance: number
    } {
        const registries = this.registries.getCache()
        .filter(registry => (
            accountId
            ? registry.accountId === accountId
            : showArchived || !this.getLocalById(registry.accountId)?.archived
        ));
        const invoices = this.invoices.getCache()
            .filter(registry => !accountId || registry.paymentAccountId === accountId);

        invoices.forEach((invoice) => {
            const invoiceRegistry = new AccountsRegistry(
                'invoice-' + invoice.id,
                RegistryType.INVOICE,
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

        return {
            registries: sortedData,
            balance: AccountsRepository.balanceCache[accountId || ''] = sortedData.reduce((acc, item) =>
                item.paid ? acc + item.value : acc,
                this.getLocalById(accountId)?.initialBalance ?? 0
            )
        };
    }
}