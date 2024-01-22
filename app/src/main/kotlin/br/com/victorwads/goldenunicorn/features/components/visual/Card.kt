package br.com.victorwads.goldenunicorn.features.components.visual

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Composable
fun Card(content: @Composable () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .background(color = Color.Black.copy(alpha = 0.1f), shape = RoundedCornerShape(10.dp))
            .padding(16.dp)
    ) {
        content()
    }
}

@Preview(showSystemUi = true)
@Composable
fun PreviewCustomCard() {
    Column {
        Card {
            Text("Blablabla")
            Text("Blablabla")
        }
        Card {
            Text("Blablabla")
            Text("Blablabla")
        }
    }
}