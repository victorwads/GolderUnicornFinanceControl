package br.com.victorwads.goldenunicorn.data.repositories

import br.com.victorwads.goldenunicorn.data.firebase.Collections
import br.com.victorwads.goldenunicorn.data.models.Account
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.CollectionReference
import com.google.firebase.firestore.DocumentReference
import kotlinx.coroutines.tasks.await

/**
TS Example

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

 */

class AccountsRepository(
    userId: String? = FirebaseAuth.getInstance().currentUser?.uid
) : BaseRepository<Account>(Account::class.java) {

    override val cacheDuration: Long = 0
    override val ref: CollectionReference

    init {
        val finalUserId = userId ?: throw Error("Invalid userId")
        ref = bd
            .collection(Collections.Users)
            .document(finalUserId)
            .collection(Collections.Accounts)
    }

    suspend fun getAll(forceCache: Boolean = false): List<Account> =
        getAllItems(forceCache)

    suspend fun add(account: Account): DocumentReference? {
        return ref.add(account).await()
    }
}