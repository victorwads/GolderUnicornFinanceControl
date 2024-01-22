package br.com.victorwads.goldenunicorn.features.components.fields

import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.util.Locale

@Composable
fun PriceField(label: String, price: Double, onPriceChange: (Float) -> Unit) {
    var text by remember { mutableStateOf(formatPrice(price)) }

    BaseField(label) {
        TextField(
            value = text,
            onValueChange = { newValue ->
                text = formatPriceInput(newValue)
                onPriceChange(parsePrice(text))
            },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
        )
    }
}

private fun formatPrice(price: Double): String {
    val formatter = DecimalFormat.getCurrencyInstance(Locale("pt", "BR")) as DecimalFormat
    return formatter.format(price)
}

private fun formatPriceInput(input: String): String {
    val cleanString = input.filter { it.isDigit() }
    val parsed = cleanString.toDoubleOrNull() ?: 0.0
    return formatPrice(parsed / 100)
}

private fun parsePrice(formattedPrice: String): Float {
    val symbols = DecimalFormatSymbols.getInstance(Locale("pt", "BR"))
    val cleanString = formattedPrice.replace(Regex("[${symbols.currencySymbol}\\s,]"), "")
    return cleanString.toFloatOrNull() ?: 0f
}

@Preview(showSystemUi = true)
@Composable
fun PriceFieldPreview() {
    PriceField(label = "Label", price = 100.0, onPriceChange = {})
}