package br.com.victorwads.goldenunicorn.data.repositories

import br.com.victorwads.goldenunicorn.data.firebase.Collections
import br.com.victorwads.goldenunicorn.data.models.Bank
import br.com.victorwads.goldenunicorn.prepareCompare

class BanksRepository: BaseRepository<Bank>(Bank::class.java) {

    override val cacheDuration = 2592000000// 30 * 24 * 60 * 60 * 1000;
    override val ref = bd.collection(Collections.Banks)

    suspend fun getAll(forceCache: Boolean = false): List<Bank> = getAllItems(forceCache) {
        it.id?.let { id -> localCache[id] = it }
    }

    suspend fun getFiltered(search: String): List<Bank> {
        val normalizedSearch = search.prepareCompare()
        val allBanks = getAll(true)
        return allBanks.filter { bank ->
            bank.name.prepareCompare().contains(normalizedSearch) ||
            bank.fullName.prepareCompare().contains(normalizedSearch)
        }
    }

    fun getById(id: String): Bank? = localCache[id]

    companion object {
        val localCache: MutableMap<String, Bank> = mutableMapOf()
    }
}