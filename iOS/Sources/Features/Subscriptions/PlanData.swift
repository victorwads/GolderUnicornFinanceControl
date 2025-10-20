import Foundation

struct SubscriptionPlan: Identifiable {
    let id: String
    let title: String
    let price: String
    let description: String
    let bullets: [String]
    let cta: String
    let badge: String?
    let highlighted: Bool
}

let subscriptionPlans: [SubscriptionPlan] = [
    .init(
        id: "free", title: "Free", price: "R$0/mês",
        description: "Grátis para sempre. Sync ativo, IA só no setup inicial.",
        bullets: [
            "5.000 registros totais",
            "IA no onboarding (1x) ou sua própria chave OpenAI",
            "Sync ativo + devices ilimitados (limite de novos devices por mês)",
        ], cta: "Começar agora", badge: nil, highlighted: false
    ),
    .init(
        id: "basic", title: "Basic", price: "R$7,90/mês (≈ $1.50)",
        description: "Para começar com IA no dia a dia.",
        bullets: [
            "50.000 registros",
            "1M tokens de IA/mês (gerenciados pelo app)",
            "Devices ilimitados + novos devices sem limite prático (monitorado)",
            "Pode usar sua própria chave OpenAI se preferir",
        ], cta: "Assinar Basic", badge: "Entrada", highlighted: false
    ),
    .init(
        id: "plus", title: "Plus", price: "R$14,90/mês (≈ $3.00)",
        description: "Melhor custo‑benefício: assistente fluido.",
        bullets: [
            "200.000 registros",
            "5M tokens de IA/mês",
            "Devices ilimitados + novos devices sem limite prático",
            "Pode usar sua própria chave OpenAI",
        ], cta: "Assinar Plus", badge: "Mais Popular", highlighted: true
    ),
    .init(
        id: "pro", title: "Pro", price: "R$29,90/mês (≈ $6.00)",
        description: "Para uso intenso e automações.",
        bullets: [
            "1.000.000 de registros",
            "10M tokens de IA/mês",
            "Devices ilimitados + novos devices sem limite prático",
            "Pode usar sua própria chave OpenAI",
        ], cta: "Assinar Pro", badge: "Máximo", highlighted: false
    ),
]

struct FeatureRowData: Identifiable { let id = UUID(); let feature: String; let values: [String] }

let comparisonRows: [FeatureRowData] = [
    .init(feature: "Sync na nuvem", values: ["✓","✓","✓","✓"]),
    .init(feature: "Devices conectados ilimitados", values: ["✓","✓","✓","✓"]),
    .init(feature: "Novos devices (full first sync)", values: ["5 vitalício","Sem limite prático (monitorado)","Sem limite prático","Sem limite prático"]),
    .init(feature: "Limite de registros", values: ["5.000","50.000","200.000","1.000.000"]),
    .init(feature: "IA incluída (tokens/mês)", values: ["Somente no onboarding (1x)","1M","5M","10M"]),
    .init(feature: "Onboarding com IA (voz/texto)", values: ["✓ (1x)","✓","✓","✓"]),
    .init(feature: "Usar a própria chave OpenAI (opcional)", values: ["✓","✓","✓","✓"]),
    .init(feature: "Exportar/Importar dados", values: ["✓","✓","✓","✓"]),
]

let transparencyNoteText = "Cobramos valores acessíveis para cobrir Firebase (leituras/escritas/armazenamento) e IA (tokens por uso). Assinantes pagos subsidiam o plano Free. Você pode usar sua própria chave OpenAI em qualquer plano."

