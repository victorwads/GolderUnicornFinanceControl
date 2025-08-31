package br.com.victorwads.goldenunicorn.data.repositories

import br.com.victorwads.goldenunicorn.data.firebase.Collections
import br.com.victorwads.goldenunicorn.data.models.CreditCard
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.CollectionReference
import com.google.firebase.firestore.DocumentReference
import kotlinx.coroutines.tasks.await

class CreditCardsRepository(
    userId: String? = FirebaseAuth.getInstance().currentUser?.uid
) : BaseRepository<CreditCard>(CreditCard::class.java) {

    override val cacheDuration: Long = 0
    override val ref: CollectionReference

    init {
        val finalUserId = userId ?: throw Error("Invalid userId")
        ref = bd
            .collection(Collections.Users)
            .document(finalUserId)
            .collection(Collections.CreditCards)
    }

    suspend fun getAll(forceCache: Boolean = false): List<CreditCard> =
        getAllItems(forceCache)

    suspend fun add(card: CreditCard): DocumentReference? {
        return ref.add(card).await()
    }
}
