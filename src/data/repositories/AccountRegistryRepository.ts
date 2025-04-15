import { getFirestore, collection, getDocs, QuerySnapshot, getDocsFromCache, addDoc, CollectionReference, DocumentData, Firestore } from 'firebase/firestore'
import { Collections } from '../../data/firebase/Collections'
import AccountsRegistry from '../models/AccountRegistry';

export default class AccountsRepository {
    private static lastUpdateKey = 'lastAccountssUpdate';
    private static cacheDuration = 30 * 24 * 60 * 60 * 1000;
    private db: Firestore
    private ref: CollectionReference<AccountsRegistry, DocumentData>;

    constructor(
        public accountId: string,
        public userId: string,
    ) {
        this.db = getFirestore()
        this.ref = collection(this.db, `${Collections.Users}/${userId}/${Collections.Accounts}/${accountId}/${Collections.Registers}`)
            .withConverter(AccountsRegistry.firestoreConverter)
    }

    private shouldUseCache() {
        let lastUpdate: string = localStorage.getItem(AccountsRepository.lastUpdateKey) ?? "0"
        return (Date.now() - parseInt(lastUpdate)) < AccountsRepository.cacheDuration
    }

    private setLastUpdate() {
        localStorage.setItem(AccountsRepository.lastUpdateKey, Date.now().toString());
    }

    public getAll = async (forceSource: null | 'server' | 'cache') => {
        let source: Promise<QuerySnapshot<AccountsRegistry>>
        if (forceSource == 'cache' || (this.shouldUseCache() && forceSource != 'server')) {
            source = getDocsFromCache(this.ref)
        } else {
            source = getDocs(this.ref)
            this.setLastUpdate()
        }
        return source.then(result => {
            let banks = result.docs.map(snap => snap.data())
            return banks.sort((a, b) => a.date.localCompare(b.date))
        })

    }

    public add = async (account: AccountsRegistry) => {
        //addDoc(this.ref)
    }

}