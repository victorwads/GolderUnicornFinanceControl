package br.com.victorwads.goldenunicorn.features.banks

import androidx.compose.runtime.Composable
import androidx.lifecycle.viewmodel.compose.viewModel
import br.com.victorwads.goldenunicorn.data.models.Bank

@Composable
fun BankSelector(
    onSelect: (Bank) -> Unit,
    viewModel: BanksSelectorViewModel = viewModel()
) {
    // TODO: Create
}