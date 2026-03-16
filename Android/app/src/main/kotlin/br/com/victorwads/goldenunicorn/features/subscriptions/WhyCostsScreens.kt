package br.com.victorwads.goldenunicorn.features.subscriptions

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@Composable
fun WhyWeChargeScreen(navController: NavController) {
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Seção 1 – Introdução Honesta")
        Text("Acreditamos que educação financeira precisa ser acessível. Por isso, o nosso plano Free é gratuito para sempre.\nMas gratuito não significa sem limites: ...")
        Text("Para mais detalhes dos nossos custos acesse aqui")
        Text("Seção 2 – Por que existem planos pagos")
        Text("Com os planos Basic, Plus e Pro, conseguimos: ...")
        Text("Para mais detalhes dos nossos custos acesse aqui")
        Text("Seção 3 – Nossos Custos")
        Text("Manter o aplicativo envolve custos reais, que crescem a cada novo usuário: ...")
        Text("Para mais detalhes dos nossos custos acesse aqui")
    }
}

@Composable
fun CostsExplainedScreen(navController: NavController) {
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Custos Explicados")
        Text("Queremos ser 100% transparentes sobre como utilizamos o dinheiro das assinaturas...")
        Text("* Valores variam conforme o volume de usuários...\n👉 Para detalhes atualizados: Firebase Pricing | OpenAI Pricing")
    }
}

