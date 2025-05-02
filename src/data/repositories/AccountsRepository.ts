import BaseRepository from './Repository';

import Account from '../models/Account'
import { Collections } from '../../data/firebase/Collections'

export default class AccountsRepository extends BaseRepository<Account> {

    protected cacheDuration = 24 * 60 * 60 * 1000;

    constructor() {
        super(`${Collections.Users}/{userId}/${Collections.Accounts}`, Account.firestoreConverter, true);
    }

}