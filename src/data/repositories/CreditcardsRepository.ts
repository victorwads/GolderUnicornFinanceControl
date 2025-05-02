import BaseRepository from './Repository';

import CreditCard from '../models/CreditCard';
import { Collections } from '../firebase/Collections'

export default class CreditcardsRepository extends BaseRepository<CreditCard> {

    protected cacheDuration = 24 * 60 * 60 * 1000;
    
    constructor() {
        super(`${Collections.Users}/{userId}/${Collections.CreditCards}`, CreditCard.firestoreConverter, true);
    }
}