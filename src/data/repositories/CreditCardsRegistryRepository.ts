import RepositoryWithCrypt from './RepositoryWithCrypt';

import { Collections } from '../firebase/Collections'
import CreditCardRegistry from '../models/CreditCardRegistry';

export default class CreditCardsRegistryRepository extends RepositoryWithCrypt<CreditCardRegistry> {
    constructor() {
        super(`${Collections.Users}/{userId}/${Collections.CreditCardRegistries}`, CreditCardRegistry);
    }
}
