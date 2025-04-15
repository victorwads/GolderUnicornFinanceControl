import { getAuth } from 'firebase/auth';

import { Collections } from '../firebase/Collections'
import CreditCard from '../models/CreditCard';
import BaseRepository from './BaseRepository';

export default class CreditcardsRepository extends BaseRepository<CreditCard> {

    protected cacheDuration = 24 * 60 * 60 * 1000;
    
    constructor(userId?: string) {
        let finalUserId = userId ?? getAuth().currentUser?.uid ?? ""
        if (finalUserId === "") {
          throw new Error("Invalid userId")
        }
        super(`${Collections.Users}/${finalUserId}/${Collections.CreditCards}`, CreditCard.firestoreConverter, true);
    }
}