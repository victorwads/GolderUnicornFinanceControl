import { CreditCardInvoice, CreditCardRegistry } from '@models';

import RepositoryWithCrypt from './RepositoryWithCrypt';
import { Collections } from '../firebase/Collections'

export default class CreditCardsRegistryRepository extends RepositoryWithCrypt<CreditCardRegistry> {
    constructor() {
        super(`${Collections.Users}/{userId}/${Collections.CreditCardRegistries}`, CreditCardRegistry);
    }

    public getRegistriesByCard(cardId: string): CreditCardRegistry[] {
        return this
            .getCache()
            .filter((registry) => registry.cardId === cardId);
    }

    public getRegistriesByInvoice(invoice: CreditCardInvoice): CreditCardRegistry[] {
        return this
            .getRegistriesByCard(invoice.cardId)
            .filter((registry) => registry.year === invoice.year && registry.month === invoice.month);
    }
}
