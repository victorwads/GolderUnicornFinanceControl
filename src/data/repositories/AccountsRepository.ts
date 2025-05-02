import { getAuth } from 'firebase/auth';

import { Collections } from '../../data/firebase/Collections'
import Account from '../models/Account'
import BaseRepository from './BaseRepository';

export default class AccountsRepository extends BaseRepository<Account> {

    protected cacheDuration = 24 * 60 * 60 * 1000;

    constructor(userId?: string) {
        let finalUserId = userId ?? getAuth().currentUser?.uid ?? (() => {
            throw new Error("Invalid userId")
        })();
        super(`${Collections.Users}/${finalUserId}/${Collections.Accounts}`, Account.firestoreConverter, true);
    }

}