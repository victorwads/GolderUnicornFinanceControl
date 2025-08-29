package br.com.victorwads.goldenunicorn.features.components.fields

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Composable
fun BaseField(label: String, content: @Composable () -> Unit) {
    Column(
        modifier = Modifier.padding(12.dp)
    ) {
        Text(text = label, modifier = Modifier.padding(bottom = 2.dp))
        content()
    }
}

@Preview(showSystemUi = true)
@Composable
fun BaseFieldPreview() {
    BaseField(label = "Label") {
        Text(text = "Content")
    }
}