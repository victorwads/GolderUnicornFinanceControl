import BaseRepository from './Repository';

import Bank from '../models/Bank'
import { Collections } from '../../data/firebase/Collections'

class BanksRepository extends BaseRepository<Bank> {
    
    protected cacheDuration = 30 * 24 * 60 * 60 * 1000 // 30 days

    constructor() {
        super(Collections.Banks, Bank.firestoreConverter, true, false)
    }

    public getFiltered = async (search: string) => {
        return this.getCache().filter(bank =>
            bank.name.prepareCompare().includes(search.prepareCompare()) ||
            bank.fullName.prepareCompare().includes(search.prepareCompare())
        )
    }

}

export default BanksRepository
