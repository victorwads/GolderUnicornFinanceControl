package br.com.victorwads.goldenunicorn.data.repositories

import br.com.victorwads.goldenunicorn.data.firebase.Collections
import br.com.victorwads.goldenunicorn.data.models.CreditCard
import br.com.victorwads.goldenunicorn.data.models.Bank
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

    // Mirror Web: getCacheWithBank(): CreditCardWithInfos[]
    fun getCacheWithBank(): List<CreditCardWithInfos> =
        cache.values.map { card ->
            val logo = if (card.brand.isNotBlank()) card.brand.lowercase() + ".png" else "carteira.jpg"
            val bank = Bank(id = null, name = card.name, fullName = card.name, logoUrl = logo)
            CreditCardWithInfos(card = card, bank = bank)
        }

    override fun addToCache(id: String, model: CreditCard) {
        val crypto = br.com.victorwads.goldenunicorn.crypt.CryptoService
        val updated = model.copy(
            name = crypto.decryptIfNeeded(model.name) ?: model.name,
            brand = crypto.decryptIfNeeded(model.brand) ?: model.brand,
            accountId = crypto.decryptIfNeeded(model.accountId) ?: model.accountId,
        )
        super.addToCache(id, updated)
    }
}

data class CreditCardWithInfos(
    val card: CreditCard,
    val bank: Bank,
) {
    val id: String get() = card.id
}
