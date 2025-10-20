package br.com.victorwads.goldenunicorn.features.subscriptions

data class Plan(
    val id: String,
    val title: String,
    val price: String,
    val description: String,
    val bullets: List<String>,
    val cta: String,
    val badge: String? = null,
    val highlighted: Boolean = false,
)

val plans = listOf(
    Plan(
        id = "free",
        title = "Free",
        price = "R$0/mês",
        description = "Grátis para sempre. Sync ativo, IA só no setup inicial.",
        bullets = listOf(
            "5.000 registros totais",
            "IA no onboarding (1x) ou sua própria chave OpenAI",
            "Sync ativo + devices ilimitados (limite de novos devices por mês)",
        ),
        cta = "Começar agora",
    ),
    Plan(
        id = "basic",
        title = "Basic",
        price = "R$7,90/mês (≈ $1.50)",
        description = "Para começar com IA no dia a dia.",
        bullets = listOf(
            "50.000 registros",
            "1M tokens de IA/mês (gerenciados pelo app)",
            "Devices ilimitados + novos devices sem limite prático (monitorado)",
            "Pode usar sua própria chave OpenAI se preferir",
        ),
        cta = "Assinar Basic",
        badge = "Entrada",
    ),
    Plan(
        id = "plus",
        title = "Plus",
        price = "R$14,90/mês (≈ $3.00)",
        description = "Melhor custo‑benefício: assistente fluido.",
        bullets = listOf(
            "200.000 registros",
            "5M tokens de IA/mês",
            "Devices ilimitados + novos devices sem limite prático",
            "Pode usar sua própria chave OpenAI",
        ),
        cta = "Assinar Plus",
        badge = "Mais Popular",
        highlighted = true,
    ),
    Plan(
        id = "pro",
        title = "Pro",
        price = "R$29,90/mês (≈ $6.00)",
        description = "Para uso intenso e automações.",
        bullets = listOf(
            "1.000.000 de registros",
            "10M tokens de IA/mês",
            "Devices ilimitados + novos devices sem limite prático",
            "Pode usar sua própria chave OpenAI",
        ),
        cta = "Assinar Pro",
        badge = "Máximo",
    ),
)

data class FeatureRow(val feature: String, val values: List<String>)

val comparisonTable = listOf(
    FeatureRow("Sync na nuvem", listOf("✓","✓","✓","✓")),
    FeatureRow("Devices conectados ilimitados", listOf("✓","✓","✓","✓")),
    FeatureRow("Novos devices (full first sync)", listOf("5 vitalício","Sem limite prático (monitorado)","Sem limite prático","Sem limite prático")),
    FeatureRow("Limite de registros", listOf("5.000","50.000","200.000","1.000.000")),
    FeatureRow("IA incluída (tokens/mês)", listOf("Somente no onboarding (1x)","1M","5M","10M")),
    FeatureRow("Onboarding com IA (voz/texto)", listOf("✓ (1x)","✓","✓","✓")),
    FeatureRow("Usar a própria chave OpenAI (opcional)", listOf("✓","✓","✓","✓")),
    FeatureRow("Exportar/Importar dados", listOf("✓","✓","✓","✓")),
)

const val transparencyNote = "Cobramos valores acessíveis para cobrir Firebase (leituras/escritas/armazenamento) e IA (tokens por uso). Assinantes pagos subsidiam o plano Free. Você pode usar sua própria chave OpenAI em qualquer plano."

