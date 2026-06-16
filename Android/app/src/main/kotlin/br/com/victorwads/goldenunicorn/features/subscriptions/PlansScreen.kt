package br.com.victorwads.goldenunicorn.features.subscriptions

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import br.com.victorwads.goldenunicorn.features.Screens

@Composable
fun PlansScreen(navController: NavController) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(modifier = Modifier.horizontalScroll(rememberScrollState())) {
            plans.forEach { p -> PlanCard(plan = p, navController = navController) }
        }
        FeatureTable()
        Text(transparencyNote, modifier = Modifier.padding(top = 24.dp))
        Row(modifier = Modifier.padding(top = 8.dp)) {
            androidx.compose.material3.TextButton(onClick = { navController.navigate(Screens.Subscriptions.Why.route) }) { Text("Por que cobramos?") }
            Text(" · ")
            androidx.compose.material3.TextButton(onClick = { navController.navigate(Screens.Subscriptions.Costs.route) }) { Text("Detalhes dos custos") }
        }
    }
}

@Composable
fun ThankYouScreen(navController: NavController) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Obrigado!", textAlign = TextAlign.Center)
        Text("Obrigado por apoiar a educação financeira! Sua contribuição nos ajuda a manter e expandir este projeto para mais pessoas no Brasil.", modifier = Modifier.padding(top = 8.dp))
    }
}

