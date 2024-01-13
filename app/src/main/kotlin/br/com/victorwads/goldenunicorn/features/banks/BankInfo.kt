package br.com.victorwads.goldenunicorn.features.banks

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.ProgressIndicatorDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import br.com.victorwads.goldenunicorn.data.models.Bank
import coil.compose.AsyncImagePainter
import coil.compose.SubcomposeAsyncImage
import coil.compose.rememberAsyncImagePainter

const val banksResourceUrl = "https://goldenunicornfc.firebaseapp.com/resources/banks/"

@Composable
fun BankInfo(bank: Bank) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(modifier = Modifier.padding(horizontal = 8.dp, vertical = 16.dp)) {
            SubcomposeAsyncImage(
                model = banksResourceUrl + bank.logoUrl,
                loading = { CircularProgressIndicator() },
                contentDescription = bank.name,
                modifier = Modifier.size(32.dp).clip(CircleShape),
                contentScale = ContentScale.Crop
            )
        }
        Spacer(modifier = Modifier.width(12.dp))
        Text(text = bank.name)
    }
    Divider()
}

@Preview
@Composable
fun PreviewBankInfo() {
    Column {
        listOf(
            Bank(id = null,"Nubank", "", "nubank.png"),
            Bank(id = null,"Itaú", "", "itau.png"),
            Bank(id = null,"MP", "", "mercadopago.png"),
        ).forEach { bank ->
            BankInfo(bank = bank)
        }
    }
}