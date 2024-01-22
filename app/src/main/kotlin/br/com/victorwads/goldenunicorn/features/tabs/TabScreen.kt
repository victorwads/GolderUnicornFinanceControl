package br.com.victorwads.goldenunicorn.features.tabs

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Divider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import br.com.victorwads.goldenunicorn.features.Screens
import br.com.victorwads.goldenunicorn.features.tabs.dashboard.DashBoardScreen
import br.com.victorwads.goldenunicorn.features.tabs.settings.SettingsScreen
import br.com.victorwads.goldenunicorn.features.tabs.timeline.TimelineScreen
import br.com.victorwads.goldenunicorn.ui.extensions.NavHost
import br.com.victorwads.goldenunicorn.ui.extensions.composable

@Preview(showSystemUi = true)
@Composable
fun TabScreen() {
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
        Divider()
        Row {
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
    Column(
        modifier = modifier
            .clickable { this.navigate(route.route) }
            .padding(vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(label)
    }
}