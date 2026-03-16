package br.com.victorwads.goldenunicorn.features.subscriptions

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import br.com.victorwads.goldenunicorn.features.Screens

@Composable
fun PlanCard(plan: Plan, navController: NavController) {
    val bg = if (plan.highlighted) MaterialTheme.colorScheme.primary.copy(alpha = 0.08f) else Color.Black.copy(alpha = 0.05f)
    Column(
        modifier = Modifier
            .padding(8.dp)
            .background(bg, RoundedCornerShape(12.dp))
            .padding(16.dp)
            .fillMaxWidth(0.85f)
    ) {
        if (plan.badge != null) {
            Text(plan.badge, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.SemiBold)
        }
        Text(plan.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text(plan.price, style = MaterialTheme.typography.titleMedium)
        Text(plan.description, modifier = Modifier.padding(top = 4.dp))
        Column(modifier = Modifier.padding(top = 8.dp)) {
            plan.bullets.forEach { b -> Text("• $b") }
        }
        Button(onClick = { navController.navigate(Screens.Subscriptions.ThankYou.route) }, contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp), modifier = Modifier.padding(top = 12.dp)) {
            Text(plan.cta)
        }
    }
}

