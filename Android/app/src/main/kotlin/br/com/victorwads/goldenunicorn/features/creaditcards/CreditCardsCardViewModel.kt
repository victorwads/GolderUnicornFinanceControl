package br.com.victorwads.goldenunicorn.features.creaditcards

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import br.com.victorwads.goldenunicorn.data.repositories.BanksRepository
import br.com.victorwads.goldenunicorn.data.repositories.CreditCardWithInfos
import br.com.victorwads.goldenunicorn.data.repositories.CreditCardsRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class CreditCardsCardViewModel(
    private val banksRepository: BanksRepository = BanksRepository(),
    private val creditCardsRepository: CreditCardsRepository = CreditCardsRepository()
): ViewModel() {

    private val _cards = MutableStateFlow<List<CreditCardWithInfos>>(emptyList())
    val cards: StateFlow<List<CreditCardWithInfos>> = _cards.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                banksRepository.getAll(forceCache = false)
                creditCardsRepository.getAll(forceCache = false)
            } catch (_: Exception) {
            } finally {
                assemble()
            }
        }
    }

    private fun assemble() {
        viewModelScope.launch(Dispatchers.Default) {
            _cards.value = creditCardsRepository.getCacheWithBank()
        }
    }
}

