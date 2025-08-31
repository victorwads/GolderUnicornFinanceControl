package br.com.victorwads.goldenunicorn.data.services

import br.com.victorwads.goldenunicorn.data.models.DebitRegistry
import br.com.victorwads.goldenunicorn.data.repositories.AccountRegistryRepository

class TimelineService(
    private val accountRegistryRepository: AccountRegistryRepository
) {
    suspend fun getAccountItems(): List<DebitRegistry> =
        accountRegistryRepository.getAll()
}
