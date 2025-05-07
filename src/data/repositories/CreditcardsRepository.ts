import RepositoryWithCrypt from './RepositoryWithCrypt';

import CreditCard from '../models/CreditCard';
import { Collections } from '../firebase/Collections'

export default class CreditcardsRepository extends RepositoryWithCrypt<CreditCard> {
    constructor() {
        super(`${Collections.Users}/{userId}/${Collections.CreditCards}`, CreditCard, true);
    }
}