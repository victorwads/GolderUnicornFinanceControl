package br.com.victorwads.goldenunicorn

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import br.com.victorwads.goldenunicorn.features.login.LoginScreenWithGoogle
import br.com.victorwads.goldenunicorn.features.tabs.TabScreen
import br.com.victorwads.goldenunicorn.ui.theme.GoldenUnicornTheme
import com.google.firebase.auth.FirebaseAuth

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        initCompose()
    }

    private fun initCompose() = setContent {
        GoldenUnicornTheme {
            Scaffold(
                contentWindowInsets = WindowInsets(0,0,0,0)
            ) {
                Surface(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(it)
                    ,
                    color = MaterialTheme.colorScheme.background
                ) {
                    val firebaseAuth = FirebaseAuth.getInstance()
                    var loggedUser by remember { mutableStateOf(firebaseAuth.currentUser != null) }

                    if (loggedUser) TabScreen()
                    else LoginScreenWithGoogle(firebaseAuth)

                    LaunchedEffect(Unit) {
                        firebaseAuth.addAuthStateListener {
                            loggedUser = it.currentUser != null
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
        text = "Hello $name!",
        modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    GoldenUnicornTheme {
        Greeting("Android")
    }
}