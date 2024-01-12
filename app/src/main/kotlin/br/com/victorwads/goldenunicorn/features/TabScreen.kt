package br.com.victorwads.goldenunicorn.features

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import br.com.victorwads.goldenunicorn.features.dashboard.DashBoardScreen
import br.com.victorwads.goldenunicorn.features.settings.SettingsScreen
import br.com.victorwads.goldenunicorn.features.timeline.TimelineScreen
import br.com.victorwads.goldenunicorn.ui.extensions.NavHost
import br.com.victorwads.goldenunicorn.ui.extensions.composable
import com.google.firebase.auth.FirebaseAuth

@Preview
@Composable
fun TabScreen(firebaseAuth: FirebaseAuth) {
    val tabNavController = rememberNavController()
    Column {
        NavHost(
            modifier = Modifier.weight(1f),
            navController = tabNavController,
            startDestination = Screens.Main.DashBoard,
        ) {
            composable(Screens.Main.DashBoard) {
                DashBoardScreen()
            }
            composable(Screens.Main.Timeline) {
                TimelineScreen()
            }
            composable(Screens.Main.Settings) {
                SettingsScreen()
            }
        }
        Row{
            tabNavController.TabButton(
                modifier = Modifier.weight(1f), "DashBoard", Screens.Main.DashBoard
            )
            tabNavController.TabButton(
                modifier = Modifier.weight(1f), "Timeline", Screens.Main.Timeline
            )
            tabNavController.TabButton(
                modifier = Modifier.weight(1f), "Settings", Screens.Main.Settings
            )
        }
    }
}

@Composable
fun NavController.TabButton(
    modifier: Modifier = Modifier,
    label: String,
    route: Screens.Main
) {
    Column(modifier = modifier.clickable {
        this.navigate(route.route)
    }, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label)
    }
}