package br.com.victorwads.goldenunicorn.features.tabs.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import br.com.victorwads.goldenunicorn.data.firebase.Collections
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

@Preview(showSystemUi = true)
@Composable
fun SettingsScreen() {
    val db = FirebaseFirestore.getInstance()
    db.collection(Collections.Banks).get().addOnCompleteListener {
        val ok = it
        ok.result.documents
    }

    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("TODO: Settings Screen")
        Button(
            onClick = { FirebaseAuth.getInstance().signOut() },
            modifier = Modifier
                .padding(16.dp)
        ) {
            Text("Logout")
        }
    }
}