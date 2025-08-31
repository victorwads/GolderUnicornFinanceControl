package br.com.victorwads.goldenunicorn.features.tabs.timeline

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import br.com.victorwads.goldenunicorn.data.models.Account
import br.com.victorwads.goldenunicorn.data.models.DebitRegistry
import br.com.victorwads.goldenunicorn.data.repositories.AccountRegistryRepository
import br.com.victorwads.goldenunicorn.data.repositories.AccountsRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.DateFormatSymbols
import java.util.Calendar
import java.util.Date

data class TimelineUiState(
    val month: Calendar = Calendar.getInstance(),
    val monthLabel: String = labelFor(Calendar.getInstance()),
    val accounts: List<Account> = emptyList(),
    val selectedAccountId: String? = null,
    val search: String = "",
    val filtered: List<RegistryLite> = emptyList(),
)

data class RegistryLite(
    val id: String?,
    val name: String,
    val description: String?,
    val value: Double,
    val date: Date,
)

class TimelineViewModel(
    private val accountsRepository: AccountsRepository = AccountsRepository()
) : ViewModel() {
    private val _uiState = MutableStateFlow(TimelineUiState())
    val uiState: StateFlow<TimelineUiState> = _uiState.asStateFlow()

    private val registriesRepo = br.com.victorwads.goldenunicorn.data.repositories.DebitRegistryRepository()
    private var allRegistries: List<DebitRegistry> = emptyList()

    fun load() {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                val accounts = accountsRepository.getAll(forceCache = true)
                _uiState.value = _uiState.value.copy(accounts = accounts)
            } catch (_: Exception) { }

            try {
                allRegistries = registriesRepo.getAll(forceCache = false)
            } catch (_: Exception) {
                allRegistries = emptyList()
            }
            refresh()
        }
    }

    fun prevMonth() { shiftMonth(-1) }
    fun nextMonth() { shiftMonth(1) }
    private fun shiftMonth(delta: Int) {
        val cal = (_uiState.value.month.clone() as Calendar).apply { add(Calendar.MONTH, delta) }
        _uiState.value = _uiState.value.copy(month = cal, monthLabel = labelFor(cal))
        refresh()
    }

    fun setSearch(q: String) {
        _uiState.value = _uiState.value.copy(search = q)
        refresh()
    }

    fun selectAccount(id: String?) {
        _uiState.value = _uiState.value.copy(selectedAccountId = id)
        refresh()
    }

    private fun refresh() {
        viewModelScope.launch(Dispatchers.IO) {
            val accountId = _uiState.value.selectedAccountId
            val regsSource = allRegistries
            val (start, end) = monthPeriod(_uiState.value.month)
            val filtered = regsSource
                .asSequence()
                .filter { it.date in start..end }
                .filter { accountId == null || it.bankId == accountId }
                .map { it.toLite() }
                .toList()
                .let { list ->
                    val q = _uiState.value.search.trim()
                    if (q.isEmpty()) list else list.filter { r ->
                        r.name.contains(q, ignoreCase = true) || (r.description?.contains(q, ignoreCase = true) == true)
                    }
                }
            _uiState.value = _uiState.value.copy(filtered = filtered)
        }
    }
}

private fun labelFor(cal: Calendar): String {
    val name = DateFormatSymbols().months[cal.get(Calendar.MONTH)]
    return "$name ${cal.get(Calendar.YEAR)}"
}

private fun monthPeriod(cal: Calendar): Pair<Date, Date> {
    val start = cal.clone() as Calendar
    start.set(Calendar.DAY_OF_MONTH, 1)
    start.set(Calendar.HOUR_OF_DAY, 0)
    start.set(Calendar.MINUTE, 0)
    start.set(Calendar.SECOND, 0)
    start.set(Calendar.MILLISECOND, 0)
    val end = start.clone() as Calendar
    end.add(Calendar.MONTH, 1)
    end.add(Calendar.MILLISECOND, -1)
    return start.time to end.time
}

private fun DebitRegistry.toLite(): RegistryLite {
    val numeric = when (val v = this.value) {
        is Number -> v.toDouble()
        is String -> v.toDoubleOrNull() ?: 0.0
        else -> 0.0
    }
    val desc = this.description ?: this.name
    return RegistryLite(
        id = this.id,
        name = this.name,
        description = desc,
        value = numeric,
        date = this.date,
    )
}
