import { getFirestore, collection, getDocs, QuerySnapshot, getDocsFromCache, Firestore, CollectionReference, DocumentData } from 'firebase/firestore'
import { Collections } from '../../data/firebase/Collections'
import Bank from '../models/Bank'

class BanksRepository {
    private static lastUpdateKey = 'lastBanksUpdate';
    private static cacheDuration = 30 * 24 * 60 * 60 * 1000;
    private static banksLocalCache: { [key: string]: Bank } = {};

    private db: Firestore
    private ref: CollectionReference<Bank, DocumentData>;

    constructor(){
        this.db = getFirestore()
        this.ref = collection(getFirestore(), Collections.Banks)
            .withConverter(Bank.firestoreConverter)
    }

    private shouldUseCache() {
        let lastUpdate: string = localStorage.getItem(BanksRepository.lastUpdateKey) ?? "0"
        return (Date.now() - parseInt(lastUpdate)) < BanksRepository.cacheDuration
    }

    private setLastUpdate() {
        localStorage.setItem(BanksRepository.lastUpdateKey, Date.now().toString());
    }

    public getAll = async (forceCache: boolean = false) => {
        let source: Promise<QuerySnapshot<Bank>>
        if(forceCache || this.shouldUseCache()) {
            source = getDocsFromCache(this.ref)
        } else {
            source = getDocs(this.ref)
            this.setLastUpdate()
        }
        return source.then(result => {
            let banks = result.docs.map(snap => snap.data())
            BanksRepository.banksLocalCache = {}
            banks.forEach(bank => {
                BanksRepository.banksLocalCache[bank.id] = bank
            })
            return banks.sort((a, b) => a.name.localeCompare(b.name))
        })
                
    }

    public getFiltered = async (search: string) => {
        let result = await this.getAll(true)
        return result.filter(bank =>
            bank.name.prepareCompare().includes(search.prepareCompare()) ||
            bank.fullName.prepareCompare().includes(search.prepareCompare())
        )
    }

    public getById = (bankId?: string): Bank | undefined => {
        return BanksRepository.banksLocalCache[bankId ?? ""]
    }

}

export default BanksRepository
