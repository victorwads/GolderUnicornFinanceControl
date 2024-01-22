package br.com.victorwads.goldenunicorn.features.banks

import androidx.lifecycle.ViewModel
import br.com.victorwads.goldenunicorn.data.models.Bank
import br.com.victorwads.goldenunicorn.data.repositories.BanksRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class BanksSelectorViewModel(
    private val banksRepository: BanksRepository
): ViewModel() {

    private val _banks = MutableStateFlow(listOf<Bank>())
    val banks = _banks.asStateFlow()

    suspend fun fetch() {
        _banks.value = banksRepository.getAll()
    }

    suspend fun search(text: String) {
        _banks.value = banksRepository.getFiltered(text)
    }
}