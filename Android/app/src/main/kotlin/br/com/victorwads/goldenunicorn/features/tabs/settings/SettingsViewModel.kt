package br.com.victorwads.goldenunicorn.features.tabs.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import br.com.victorwads.goldenunicorn.GoldenApplication
import br.com.victorwads.goldenunicorn.data.services.SettingsService
import br.com.victorwads.goldenunicorn.data.repositories.*
import com.google.gson.Gson
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class SettingsViewModel(
    private val service: SettingsService = SettingsService(GoldenApplication.publicApplication)
) : ViewModel() {
    private val repos by lazy { br.com.victorwads.goldenunicorn.data.repositories.RepositoriesProvider.ensureFromCurrentUser() }
    val darkTheme: StateFlow<Boolean> = service.darkTheme.stateIn(
        viewModelScope,
        SharingStarted.Eagerly,
        false
    )

    fun setDarkTheme(enabled: Boolean) {
        viewModelScope.launch { service.setDarkTheme(enabled) }
    }

    val financeMode = service.financeMode.stateIn(viewModelScope, SharingStarted.Eagerly, "start")
    val financeDay = service.financeDay.stateIn(viewModelScope, SharingStarted.Eagerly, 1)

    fun setFinanceMode(mode: String) { viewModelScope.launch { service.setFinanceMode(mode) } }
    fun setFinanceDay(day: Int) { viewModelScope.launch { service.setFinanceDay(day) } }

    fun exportJson(callback: (String) -> Unit) {
        viewModelScope.launch {
            val accounts = repos.getAllAccounts(forceCache = true)
            val banks = repos.getAllBanks(forceCache = true)
            val categories = repos.getAllCategories(forceCache = true)
            val cards = repos.getAllCreditCards(forceCache = true)
            val debit = mutableListOf<br.com.victorwads.goldenunicorn.data.models.DebitRegistry>()
            for (acc in accounts) {
                val accId = acc.id
                if (accId.isNotEmpty()) {
                    debit += br.com.victorwads.goldenunicorn.data.repositories.AccountRegistryRepository(accountId = accId).getAll(forceCache = true)
                }
            }
            val export = mapOf(
                "accounts" to accounts,
                "banks" to banks,
                "categories" to categories,
                "creditCards" to cards,
                "accountRegistries" to debit,
            )
            callback(Gson().toJson(export))
        }
    }
}
