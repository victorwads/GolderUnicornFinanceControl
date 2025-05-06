import BaseRepository from './Repository';

import CreditCard from '../models/CreditCard';
import { Collections } from '../firebase/Collections'

export default class CreditcardsRepository extends BaseRepository<CreditCard> {
    constructor() {
        super(`${Collections.Users}/{userId}/${Collections.CreditCards}`, CreditCard.firestoreConverter, true);
    }
}