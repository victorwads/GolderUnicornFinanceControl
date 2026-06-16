package br.com.victorwads.goldenunicorn.features.accounts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import br.com.victorwads.goldenunicorn.data.models.Account
import br.com.victorwads.goldenunicorn.data.models.Bank
import br.com.victorwads.goldenunicorn.data.repositories.AccountsRepository
import br.com.victorwads.goldenunicorn.data.repositories.BanksRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class WithInfoAccount(
    val account: Account,
    val bank: Bank,
)

class AccountsCardViewModel : ViewModel() {
    private val repos by lazy { br.com.victorwads.goldenunicorn.data.repositories.RepositoriesProvider.ensureFromCurrentUser() }

    private val _accounts = MutableStateFlow<List<WithInfoAccount>>(emptyList())
    val accounts: StateFlow<List<WithInfoAccount>> = _accounts.asStateFlow()

    private val _showArchived = MutableStateFlow(false)
    val showArchived = _showArchived.asStateFlow()

    init {
        refresh()
    }

    fun toggleShowArchived() {
        _showArchived.value = !_showArchived.value
        assemble()
    }

    fun refresh() {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                // Load banks (fills static local cache) and accounts
                repos.getAllBanks(forceCache = false)
                repos.getAllAccounts(forceCache = false)
            } catch (_: Exception) {
                // ignore errors here; fallback to cache
            } finally {
                assemble()
            }
        }
    }

    private fun assemble() {
        viewModelScope.launch(Dispatchers.Default) {
            val items = repos.getAccountsCache(showArchived = _showArchived.value)
            .map { acc ->
                val bank = acc.bankId?.let { BanksRepository.localCache[it] }
                    ?: Bank(id = null, name = acc.name, fullName = acc.name, logoUrl = "carteira.jpg")
                WithInfoAccount(account = acc, bank = bank)
            }
            android.util.Log.d(
                "AccountsVM",
                "Assembled ${items.size} accounts (showArchived=${_showArchived.value}); total cached=${repos.getAccountsCache(true).size}"
            )
            _accounts.value = items
        }
    }
}
