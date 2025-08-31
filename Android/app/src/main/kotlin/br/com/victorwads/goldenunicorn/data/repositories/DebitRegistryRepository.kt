package br.com.victorwads.goldenunicorn.data.repositories

import br.com.victorwads.goldenunicorn.data.firebase.Collections
import br.com.victorwads.goldenunicorn.data.models.DebitRegistry
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.CollectionReference
import com.google.firebase.firestore.Source
import com.google.firebase.Timestamp
import kotlinx.coroutines.tasks.await
import br.com.victorwads.goldenunicorn.crypt.CryptoService
import br.com.victorwads.goldenunicorn.crypt.NumericDecryptor
import java.util.Date

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

    suspend fun getAll(forceCache: Boolean = false): List<DebitRegistry> {
        return try {
            val source = if (forceCache) Source.CACHE else Source.DEFAULT
            val snap = ref.get(source).await()
            val list = snap.documents.mapNotNull { doc ->
                val raw = doc.data ?: return@mapNotNull null

                fun decStr(key: String): String? = CryptoService.decryptIfNeeded(raw[key] as? String)
                fun decNum(value: Any?): Any? = when (value) {
                    is Number -> NumericDecryptor.decryptToPrimitive(value)
                    else -> value
                }

                val accountId = decStr("accountId") ?: (raw["bankId"] as? String ?: "")
                val description = decStr("description") ?: (raw["name"] as? String ?: "")
                val categoryId = decStr("categoryId")
                val valueAny = decNum(raw["value"]) ?: 0.0
                val paidAny = when (val p = raw["paid"]) {
                    is Boolean -> p
                    is Number -> (NumericDecryptor.decryptToPrimitive(p) as? Boolean) ?: false
                    else -> false
                }
                val date: Date = when (val d = raw["date"]) {
                    is Timestamp -> d.toDate()
                    is Number -> (NumericDecryptor.decryptToPrimitive(d) as? Date) ?: Date()
                    else -> Date()
                }

                DebitRegistry(
                    id = doc.id,
                    bankId = accountId,
                    name = description,
                    description = description,
                    categoryId = categoryId,
                    date = date,
                    paid = paidAny,
                    value = when (valueAny) {
                        is Number -> valueAny.toDouble()
                        is String -> valueAny.toDoubleOrNull() ?: 0.0
                        else -> 0.0
                    },
                    metadata = null,
                ).also { addToCache(doc.id, it) }
            }
            list
        } catch (e: Exception) {
            emptyList()
        }
    }
}
