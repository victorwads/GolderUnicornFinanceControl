package br.com.victorwads.goldenunicorn.data.repositories

import android.content.Context
import br.com.victorwads.goldenunicorn.data.firebase.Collections
import br.com.victorwads.goldenunicorn.data.models.Bank
import br.com.victorwads.goldenunicorn.prepareCompare
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Source
import com.google.firebase.firestore.toObject
import java.util.Date
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine
class BanksRepository(context: Context) {

    private val bd = FirebaseFirestore.getInstance()
    private val ref = bd.collection(Collections.Banks)
    private val localStorage = context
        .getSharedPreferences(Collections.FirestoreCacheKeys, Context.MODE_PRIVATE)

    private fun shouldUseCache() = localStorage.getLong(lastUpdateKey, 0).let {
        (Date().time - it) < cacheDuration
    }

    private fun setLastUpdate() = with(localStorage.edit()) {
        putLong(lastUpdateKey, Date().time)
        apply()
    }

    suspend fun getAll(forceCache: Boolean = false) = suspendCoroutine<List<Bank>> { thread ->
        val source = if(forceCache || shouldUseCache()) Source.CACHE
        else Source.DEFAULT
        if(source == Source.DEFAULT) setLastUpdate()
        ref.get(source).addOnCompleteListener {task ->
            if(task.isSuccessful){
                thread.resume(task.result.documents.mapNotNull {
                    it.toObject<Bank>()
                }.sortedBy { it.name })
            } else {
                thread.resume(arrayListOf())
            }
        }
    }

    suspend fun getFiltered(search: String): List<Bank> {
        val normalizedSearch = search.prepareCompare()
        val allBanks = getAll(true)
        return allBanks.filter { bank ->
            bank.name.prepareCompare().contains(normalizedSearch) ||
            bank.fullName.prepareCompare().contains(normalizedSearch)
        }
    }

    companion object {
        const val lastUpdateKey = "lastBanksUpdate"
        const val cacheDuration = 2592000000// 30 * 24 * 60 * 60 * 1000;
    }
}