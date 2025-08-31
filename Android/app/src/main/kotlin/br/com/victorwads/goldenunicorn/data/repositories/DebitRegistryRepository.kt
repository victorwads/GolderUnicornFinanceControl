package br.com.victorwads.goldenunicorn.data.repositories

import br.com.victorwads.goldenunicorn.data.firebase.Collections
import br.com.victorwads.goldenunicorn.data.models.DebitRegistry
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.CollectionReference

class DebitRegistryRepository(
    userId: String? = FirebaseAuth.getInstance().currentUser?.uid,
): BaseRepository<DebitRegistry>(DebitRegistry::class.java)  {

    override val cacheDuration: Long = 0
    override val ref: CollectionReference

    init {
        val finalUserId = userId ?: throw Error("Invalid userId")
        ref = bd
            .collection(Collections.Users)
            .document(finalUserId)
            .collection(Collections.AccountsRegistries)
        }

    suspend fun getAll(forceCache: Boolean = false): List<DebitRegistry> = getAllItems(forceCache)
}
