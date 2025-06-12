import RepositoryWithCrypt from './RepositoryWithCrypt';
import { Collections } from '../firebase/Collections'

import { CreditCard } from "@models";

export default class CreditcardsRepository extends RepositoryWithCrypt<CreditCard> {
    constructor() {
        super(`${Collections.Users}/{userId}/${Collections.CreditCards}`, CreditCard);
    }
}
