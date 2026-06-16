package br.com.victorwads.goldenunicorn.features.tabs.settings

import android.content.Intent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Divider
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import br.com.victorwads.goldenunicorn.R
import br.com.victorwads.goldenunicorn.features.Screens
import com.google.firebase.auth.FirebaseAuth

@Preview(showSystemUi = true)
@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel = viewModel(),
    onNavigate: (Screens) -> Unit = {}
) {
    val ctx = LocalContext.current
    val darkTheme by viewModel.darkTheme.collectAsState()
    val financeMode by viewModel.financeMode.collectAsState()
    val financeDay by viewModel.financeDay.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.Start
    ) {
        Text("Gestão Financeira"); Divider()
        Row(Modifier.fillMaxWidth()) {
            Button(onClick = { onNavigate(Screens.Accounts) }, modifier = Modifier.padding(8.dp)) { Text(stringResource(id = R.string.settings_accounts)) }
            Button(onClick = { onNavigate(Screens.Categories) }, modifier = Modifier.padding(8.dp)) { Text(stringResource(id = R.string.settings_categories)) }
            Button(onClick = { onNavigate(Screens.CreditCards) }, modifier = Modifier.padding(8.dp)) { Text(stringResource(id = R.string.settings_credit_cards)) }
        }

        Text("Preferências"); Divider()
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Modo do período", modifier = Modifier.weight(1f))
            Button(onClick = { viewModel.setFinanceMode(if (financeMode == "start") "next" else "start") }) {
                Text(financeMode)
            }
        }
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Dia de corte: $financeDay", modifier = Modifier.weight(1f))
            Button(onClick = { viewModel.setFinanceDay((financeDay % 28) + 1) }) { Text("+1") }
        }

        Text("Aparência"); Divider()
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = stringResource(id = R.string.settings_dark_theme),
                modifier = Modifier.weight(1f)
            )
            Switch(checked = darkTheme, onCheckedChange = { viewModel.setDarkTheme(it) })
        }

        Text("Meus Dados"); Divider()
        Row(Modifier.fillMaxWidth()) {
            Button(onClick = {
                viewModel.exportJson { json ->
                    val share = Intent(Intent.ACTION_SEND).apply {
                        type = "application/json"
                        putExtra(Intent.EXTRA_TEXT, json)
                    }
                    ctx.startActivity(Intent.createChooser(share, "Export Data"))
                }
            }, modifier = Modifier.padding(8.dp)) { Text("Exportar dados") }
            Button(onClick = { FirebaseAuth.getInstance().signOut() }, modifier = Modifier.padding(8.dp)) { Text(stringResource(id = R.string.settings_logout)) }
        }

        Text("Beta"); Divider()
        Button(onClick = { onNavigate(br.com.victorwads.goldenunicorn.features.Screens.Subscriptions.Plans) }) {
            Text("Subscriptions (Only Informative)")
        }
    }
}
