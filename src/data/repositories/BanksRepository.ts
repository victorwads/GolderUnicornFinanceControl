import BaseRepository from './Repository';

import Bank from '../models/Bank'
import { Collections } from '../../data/firebase/Collections'

class BanksRepository extends BaseRepository<Bank> {
    
    constructor() {
        super(Collections.Banks, Bank.firestoreConverter, 30 * 24 * 60 * 60 * 1000 /* 30 days */)
    }

    public getFiltered = async (search: string) => {
        return this.getCache().filter(bank =>
            bank.name.prepareCompare().includes(search.prepareCompare()) ||
            bank.fullName.prepareCompare().includes(search.prepareCompare())
        )
    }

}

export default BanksRepository
