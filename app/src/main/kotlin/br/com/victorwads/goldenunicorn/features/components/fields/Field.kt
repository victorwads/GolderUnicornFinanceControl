package br.com.victorwads.goldenunicorn.features.components.fields

import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.tooling.preview.Preview

@Composable
fun Field(label: String, value: String, onValueChange: (String) -> Unit) {
    var text by remember { mutableStateOf(value) }

    BaseField(label) {
        TextField(
            value = text,
            onValueChange = {
                text = it
                onValueChange(it)
            },
        )
    }
}

@Preview(showSystemUi = true)
@Composable
fun FieldPreview() {
    Field(label = "Label", value = "Value", onValueChange = {})
}