package br.com.victorwads.goldenunicorn.features.creaditcards

import androidx.compose.foundation.layout.Column
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
fun CreditCardsCard(
    viewModel: CreditCardsCardViewModel = viewModel()
) {
    val cards by viewModel.cards.collectAsState()

    Text(text = "Credit Cards")
    Card {
        Column(
            modifier = Modifier.semantics { contentDescription = "Dashboard.CreditCards.List" }
        ) {
            cards.forEach { item ->
                Column(
                    modifier = Modifier.semantics { contentDescription = "CreditCardCard.${item.id}" }
                ) {
                    BankInfo(bank = item.bank)
                }
            }
            if (cards.isEmpty()) {
                Text("No credit cards")
            }
        }
    }
}
