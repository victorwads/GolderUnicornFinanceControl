package br.com.victorwads.goldenunicorn.features.tabs.timeline

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import br.com.victorwads.goldenunicorn.data.models.Account
import java.text.NumberFormat
import java.util.Locale

@Composable
fun TimelineScreen(
    viewModel: TimelineViewModel = viewModel()
) {
    val ui by viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) { viewModel.load() }

    Column(modifier = Modifier.fillMaxSize().padding(12.dp)) {
        // Month selector and account selector
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { viewModel.prevMonth() }) { Text("<") }
                Text(ui.monthLabel)
                Button(onClick = { viewModel.nextMonth() }) { Text(">") }
            }
            AccountSelector(
                accounts = ui.accounts,
                selectedId = ui.selectedAccountId,
                onSelect = { viewModel.selectAccount(it) }
            )
        }

        OutlinedTextField(
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
            value = ui.search,
            onValueChange = { viewModel.setSearch(it) },
            label = { Text("Search") }
        )

        LazyColumn(modifier = Modifier.fillMaxSize().padding(top = 8.dp)) {
            if (ui.filtered.isEmpty()) {
                item { Text("No items") }
            }
            items(ui.filtered, key = { it.id ?: "" }) { r ->
                Row(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
                    Text(text = r.description ?: r.name)
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                        Text(text = formatCurrency(r.value))
                    }
                }
            }
        }
    }
}

@Composable
private fun AccountSelector(
    accounts: List<Account>,
    selectedId: String?,
    onSelect: (String?) -> Unit
) {
    var expanded = androidx.compose.runtime.remember { androidx.compose.runtime.mutableStateOf(false) }
    Column {
        Button(onClick = { expanded.value = true }) {
            Text(accounts.firstOrNull { it.id == selectedId }?.name ?: "All accounts")
        }
        DropdownMenu(expanded = expanded.value, onDismissRequest = { expanded.value = false }) {
            DropdownMenuItem(text = { Text("All accounts") }, onClick = {
                expanded.value = false; onSelect(null)
            })
            accounts.forEach { acc ->
                DropdownMenuItem(text = { Text(acc.name) }, onClick = {
                    expanded.value = false; onSelect(acc.id)
                })
            }
        }
    }
}

private fun formatCurrency(value: Double): String {
    return NumberFormat.getCurrencyInstance(Locale("pt", "BR")).format(value)
}
