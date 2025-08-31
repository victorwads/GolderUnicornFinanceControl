package br.com.victorwads.goldenunicorn.features.accounts

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.lifecycle.viewmodel.compose.viewModel
import br.com.victorwads.goldenunicorn.features.banks.BankInfo
import br.com.victorwads.goldenunicorn.features.components.visual.Card

@Composable
fun AccountsCard(
    viewModel: AccountsCardViewModel = viewModel()
) {
    val accounts by viewModel.accounts.collectAsState()
    val showArchived by viewModel.showArchived.collectAsState()

    Text(text = "Accounts")
    Row(modifier = Modifier.fillMaxWidth()) {
        Checkbox(checked = showArchived, onCheckedChange = { viewModel.toggleShowArchived() })
        Text(text = "Show archived")
    }
    Card {
        Column(
            modifier = Modifier.semantics { contentDescription = "Dashboard.Accounts.List" }
        ) {
            accounts.forEach { item ->
                Column(
                    modifier = Modifier.semantics { contentDescription = "AccountCard.${item.account.id}" }
                ) {
                    BankInfo(bank = item.bank)
                }
            }
            if (accounts.isEmpty()) {
                Text("No accounts")
            }
        }
    }
}
