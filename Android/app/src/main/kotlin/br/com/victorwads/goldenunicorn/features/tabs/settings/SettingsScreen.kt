package br.com.victorwads.goldenunicorn.features.tabs.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import br.com.victorwads.goldenunicorn.R
import com.google.firebase.auth.FirebaseAuth

@Preview(showSystemUi = true)
@Composable
fun SettingsScreen(viewModel: SettingsViewModel = viewModel()) {
//    val db = FirebaseFirestore.getInstance()
//    db.collection(Collections.Banks).get().addOnCompleteListener {
//        val ok = it
//        ok.result.documents
//    }

    val darkTheme by viewModel.darkTheme.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.Top,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
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
        Button(onClick = { }, modifier = Modifier.padding(16.dp)) {
            Text(stringResource(id = R.string.settings_accounts))
        }
        Button(onClick = { }, modifier = Modifier.padding(16.dp)) {
            Text(stringResource(id = R.string.settings_categories))
        }
        Button(onClick = { }, modifier = Modifier.padding(16.dp)) {
            Text(stringResource(id = R.string.settings_credit_cards))
        }
        Button(
            onClick = { FirebaseAuth.getInstance().signOut() },
            modifier = Modifier.padding(16.dp)
        ) {
            Text(stringResource(id = R.string.settings_logout))
        }
    }
}