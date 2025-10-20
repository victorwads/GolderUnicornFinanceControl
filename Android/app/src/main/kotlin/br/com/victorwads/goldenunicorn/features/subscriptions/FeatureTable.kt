package br.com.victorwads.goldenunicorn.features.subscriptions

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Divider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun FeatureTable() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Recurso", fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1.5f))
            plans.forEach { p -> Text(p.title, modifier = Modifier.weight(1f)) }
        }
        Divider()
        comparisonTable.forEach { row ->
            Row(Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
                Text(row.feature, modifier = Modifier.weight(1.5f))
                row.values.forEach { v -> Text(v, modifier = Modifier.weight(1f)) }
            }
            Divider(color = Color.Black.copy(alpha = 0.06f))
        }
    }
}

