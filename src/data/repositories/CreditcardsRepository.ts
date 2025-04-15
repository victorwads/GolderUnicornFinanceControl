import { getFirestore, collection, getDocs, QuerySnapshot, getDocsFromCache, addDoc, CollectionReference, DocumentData, Firestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth';

import { Collections } from '../firebase/Collections'
import CreditCard from '../models/CreditCard';

export default class CreditcardsRepository {
    private static lastUpdateKey = 'lastCreditCardsUpdate';
    private static cacheDuration = 24 * 60 * 60 * 1000;
    private db: Firestore
    private ref: CollectionReference<CreditCard, DocumentData>;

    constructor(userId?: string) {
        let finalUserId = userId ?? getAuth().currentUser?.uid ?? ""
        if (finalUserId == "") {
          throw new Error("Invalid userId")
        }
        this.db = getFirestore()
        this.ref = collection(this.db, `${Collections.Users}/${finalUserId}/${Collections.CreditCards}`)
            .withConverter(CreditCard.firestoreConverter)

        console.log("CreditcardsRepository: ref", `${Collections.Users}/${finalUserId}/${Collections.CreditCards}`);
    }

    private shouldUseCache() {
        let lastUpdate: string = localStorage.getItem(CreditcardsRepository.lastUpdateKey) ?? "0"
        return (Date.now() - parseInt(lastUpdate)) < CreditcardsRepository.cacheDuration
    }

    private setLastUpdate() {
        localStorage.setItem(CreditcardsRepository.lastUpdateKey, Date.now().toString());
    }

    public getAll = async (forceSource: null | 'server' | 'cache' = null) => {
        let source: QuerySnapshot<CreditCard>
        if (forceSource == 'cache' || (this.shouldUseCache() && forceSource != 'server')) {
            source = await getDocsFromCache(this.ref)
        } else {
            source = await getDocs(this.ref)
            this.setLastUpdate()
        }

        return source.docs.map(snap => snap.data())
    }

    public add = async (account: CreditCard) => addDoc(this.ref, account)

}