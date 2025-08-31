package br.com.victorwads.goldenunicorn.data.services

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "settings")

class SettingsService(private val context: Context) {
    private val DARK_THEME = booleanPreferencesKey("dark_theme")
    private val FINANCE_MODE = androidx.datastore.preferences.core.stringPreferencesKey("finance_mode")
    private val FINANCE_DAY = androidx.datastore.preferences.core.intPreferencesKey("finance_day")

    val darkTheme: Flow<Boolean> = context.dataStore.data.map { it[DARK_THEME] ?: false }
    val financeMode: Flow<String> = context.dataStore.data.map { it[FINANCE_MODE] ?: "start" }
    val financeDay: Flow<Int> = context.dataStore.data.map { it[FINANCE_DAY] ?: 1 }

    suspend fun setDarkTheme(enabled: Boolean) {
        context.dataStore.edit { it[DARK_THEME] = enabled }
    }

    suspend fun setFinanceMode(mode: String) {
        context.dataStore.edit { it[FINANCE_MODE] = mode }
    }

    suspend fun setFinanceDay(day: Int) {
        context.dataStore.edit { it[FINANCE_DAY] = day }
    }
}
