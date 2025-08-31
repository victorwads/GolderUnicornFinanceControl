package br.com.victorwads.goldenunicorn.features.tabs.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import br.com.victorwads.goldenunicorn.GoldenApplication
import br.com.victorwads.goldenunicorn.data.services.SettingsService
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class SettingsViewModel(
    private val service: SettingsService = SettingsService(GoldenApplication.publicApplication)
) : ViewModel() {
    val darkTheme: StateFlow<Boolean> = service.darkTheme.stateIn(
        viewModelScope,
        SharingStarted.Eagerly,
        false
    )

    fun setDarkTheme(enabled: Boolean) {
        viewModelScope.launch { service.setDarkTheme(enabled) }
    }
}
