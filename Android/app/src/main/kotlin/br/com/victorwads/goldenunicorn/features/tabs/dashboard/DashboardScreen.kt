package br.com.victorwads.goldenunicorn.features.tabs.dashboard

import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.scrollable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import br.com.victorwads.goldenunicorn.features.accounts.AccountsCard
import br.com.victorwads.goldenunicorn.features.components.visual.Card
import br.com.victorwads.goldenunicorn.features.creaditcards.CreditCardsCard

@Preview(showSystemUi = true)
@Composable
fun DashBoardScreen(
    viewModel: DashboardScreenViewModel = viewModel()
) {
    val scrollState = rememberScrollState()
    val userName by viewModel.userName.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .scrollable(
                orientation = Orientation.Vertical,
                state = scrollState
            )
    ) {
        Text(userName)

        AccountsCard()
        CreditCardsCard()

        Text("Other")
        Card {
            Text("Other")
        }
    }
}
