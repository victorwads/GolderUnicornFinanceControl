package br.com.victorwads.goldenunicorn.features.timeline

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import br.com.victorwads.goldenunicorn.data.models.Bank
import br.com.victorwads.goldenunicorn.data.repositories.BanksRepository
import br.com.victorwads.goldenunicorn.features.banks.BankInfo
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch

@OptIn(ExperimentalFoundationApi::class)
@Preview
@Composable
fun TimelineScreen() {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    var banks: List<Bank> by remember { mutableStateOf(listOf()) }

    LaunchedEffect(Unit) {
        val repository = BanksRepository(context)
        coroutineScope {
            launch {
                banks = repository.getAll()
            }
        }
    }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        stickyHeader {
            Text("TimeLine Screen")
        }
        items(banks, key = { it.id ?: "" }) {
            BankInfo(bank = it)
        }
    }
}