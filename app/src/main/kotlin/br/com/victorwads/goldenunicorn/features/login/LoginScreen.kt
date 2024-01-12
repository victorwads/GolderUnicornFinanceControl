package br.com.victorwads.goldenunicorn.features.login

import android.app.Activity
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Face
import androidx.compose.material.icons.twotone.Person
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import br.com.victorwads.goldenunicorn.R
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.OAuthProvider

@Composable
fun LoginScreenWithGoogle(firebaseAuth: FirebaseAuth) {
    var stateLogin by remember { mutableStateOf(false) }
    var loggedUser by remember { mutableStateOf(firebaseAuth.currentUser != null) }

    val context = LocalContext.current
    val googleSignInLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)

        try {
            val account = task.getResult(ApiException::class.java)
            val credential = GoogleAuthProvider.getCredential(account?.idToken, null)

            firebaseAuth
                .signInWithCredential(credential)
                .addOnCompleteListener {
                    stateLogin = false
                }
        } catch (e: ApiException) {
            stateLogin = false
            Toast.makeText(context, "Google Sign-In failed!", Toast.LENGTH_SHORT).show()
        }
    }
    val launcher = {
        stateLogin = true
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(context.getString(R.string.default_web_client_id))
            .requestId()
            .requestEmail()
            .requestProfile()
            .build()
        val googleSignInClient = GoogleSignIn.getClient(context, gso)

        googleSignInLauncher.launch(googleSignInClient.signInIntent)
    }
    LaunchedEffect(Unit) {
        loggedUser = firebaseAuth.currentUser != null
        firebaseAuth.addAuthStateListener {
            loggedUser = it.currentUser != null
        }
    }
    if (loggedUser || stateLogin) {
        LoginScreenLoading()
    } else {
        LoginScreen(launcher, {
            val provider = OAuthProvider.newBuilder("apple.com")
            provider.setScopes(mutableListOf("email", "name", "profile"))

            val pending = firebaseAuth.pendingAuthResult
            if (pending == null) {
                firebaseAuth.startActivityForSignInWithProvider(
                    context as Activity,
                    provider.build()
                )
            }
        }, stateLogin)
    }
}

@Preview
@Composable
private fun LoginScreen(
    googleSignIn: () -> Unit = {},
    appleSignIn: () -> Unit = {},
    loading: Boolean = false
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        if (loading) {
            CircularProgressIndicator(
                modifier = Modifier.width(64.dp)
            )
        } else {
            Button(
                onClick = googleSignIn,
                modifier = Modifier
                    .padding(8.dp)
            ) {
                Icon(
                    imageVector = Icons.TwoTone.Person,
                    contentDescription = "Sign In with Google",
                    modifier = Modifier.padding(end = 8.dp)
                )
                Text("Sign In with Google")
            }
            Button(
                onClick = appleSignIn,
                modifier = Modifier
                    .padding(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Face,
                    contentDescription = "Sign In with Apple ID",
                    modifier = Modifier.padding(end = 8.dp)
                )
                Text("Sign In with Apple ID")
            }
        }
    }
}

@Preview
@Composable
private fun LoginScreenLoading() {
    LoginScreen(loading = true)
}
