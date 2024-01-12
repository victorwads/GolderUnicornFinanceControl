package br.com.victorwads.goldenunicorn.features.dashboard

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
import com.google.firebase.auth.FirebaseAuth

@Preview
@Composable
private fun TempUserScreen(
    userInfo: String = "User - Email",
    logOut: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(userInfo)
        Button(
            onClick = logOut,
            modifier = Modifier
                .padding(16.dp)
        ) {
            Text("Logout")
        }
    }
}

@Preview
@Composable
fun DashBoardScreen() {
    val firebaseAuth = FirebaseAuth.getInstance()

    TempUserScreen(firebaseAuth.currentUser.let { "${it?.displayName} - ${it?.email}" }) {
        firebaseAuth.signOut()
    }
}