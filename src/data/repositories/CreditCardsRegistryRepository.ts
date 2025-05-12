import RepositoryWithCrypt from './RepositoryWithCrypt';

import { Collections } from '../firebase/Collections'
import CreditCardRegistry from '../models/CreditCardRegistry';
import CreditCardInvoice from '../models/CreditCardInvoice';

export default class CreditCardsRegistryRepository extends RepositoryWithCrypt<CreditCardRegistry> {
    constructor() {
        super(`${Collections.Users}/{userId}/${Collections.CreditCardRegistries}`, CreditCardRegistry);
    }

    public async getRegistriesByInvoice(invoice: CreditCardInvoice): Promise<CreditCardRegistry[]> {
        return this.getCache().filter((registry) => {
            return registry.cardId === invoice.cardId &&
                registry.year === invoice.year &&
                registry.month === invoice.month;
        });
    }
}
