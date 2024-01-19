import { getFirestore, collection, getDocs, QuerySnapshot, getDocsFromCache, addDoc, CollectionReference, DocumentData, Firestore } from 'firebase/firestore'
import { Collections } from '../../data/firebase/Collections'
import Account from '../models/Account'
import { getAuth } from 'firebase/auth';

export default class AccountsRepository {
    private static lastUpdateKey = 'lastAccountsUpdate';
    private static cacheDuration = 24 * 60 * 60 * 1000;
    private db: Firestore
    private ref: CollectionReference<Account, DocumentData>;

    constructor(userId?: string) {
        let finalUserId = userId ?? getAuth().currentUser?.uid ?? ""
        if (finalUserId == "") {
          throw new Error("Invalid userId")
        }
        this.db = getFirestore()
        this.ref = collection(this.db, `${Collections.Users}/${finalUserId}/${Collections.Accounts}`)
            .withConverter(Account.firestoreConverter)
    }

    private shouldUseCache() {
        let lastUpdate: string = localStorage.getItem(AccountsRepository.lastUpdateKey) ?? "0"
        return (Date.now() - parseInt(lastUpdate)) < AccountsRepository.cacheDuration
    }

    private setLastUpdate() {
        localStorage.setItem(AccountsRepository.lastUpdateKey, Date.now().toString());
    }

    public getAll = async (forceSource: null | 'server' | 'cache' = null) => {
        let source: QuerySnapshot<Account>
        if (forceSource == 'cache' || (this.shouldUseCache() && forceSource != 'server')) {
            source = await getDocsFromCache(this.ref)
        } else {
            source = await getDocs(this.ref)
            this.setLastUpdate()
        }

        return source.docs.map(snap => snap.data())
    }

    public add = async (account: Account) => addDoc(this.ref, account)

}