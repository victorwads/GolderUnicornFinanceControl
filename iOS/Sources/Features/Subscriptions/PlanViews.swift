import SwiftUI

struct PlanCardView: View {
    let plan: SubscriptionPlan
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            if let badge = plan.badge { Text(badge).foregroundColor(.blue).font(.footnote) }
            Text(plan.title).font(.title3).bold()
            Text(plan.price).font(.headline)
            Text(plan.description)
            VStack(alignment: .leading, spacing: 4) {
                ForEach(plan.bullets, id: \.self) { Text("• \($0)") }
            }
            Button(plan.cta) {}
        }
        .padding(16)
        .frame(maxWidth: 280)
        .background((plan.highlighted ? Color.blue.opacity(0.08) : Color.black.opacity(0.05)))
        .cornerRadius(12)
    }
}

struct FeatureTableView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Recurso").font(.subheadline).bold().frame(maxWidth: .infinity, alignment: .leading)
                ForEach(subscriptionPlans) { p in Text(p.title).frame(maxWidth: .infinity, alignment: .leading) }
            }
            Divider()
            ForEach(comparisonRows) { row in
                HStack(alignment: .top) {
                    Text(row.feature).frame(maxWidth: .infinity, alignment: .leading)
                    ForEach(row.values, id: \.self) { v in Text(v).frame(maxWidth: .infinity, alignment: .leading) }
                }
                Divider()
            }
        }
    }
}

struct SubscriptionsPlansView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack { ForEach(subscriptionPlans) { PlanCardView(plan: $0).padding(.trailing, 8) } }
                        .padding(.horizontal, 8)
                }
                FeatureTableView()
                Text(transparencyNoteText).padding(.top, 8)
                HStack {
                    NavigationLink("Por que cobramos?") { WhyWeChargeView() }
                    Text(" · ")
                    NavigationLink("Detalhes dos custos") { CostsExplainedView() }
                }
            }.padding(16)
        }
        .navigationTitle("Assinaturas")
    }
}

struct WhyWeChargeView: View {
    var body: some View {
        ScrollView { VStack(alignment: .leading, spacing: 12) {
            Text("Seção 1 – Introdução Honesta").font(.headline)
            Text("Acreditamos que educação financeira precisa ser acessível. Por isso, o nosso plano Free é gratuito para sempre.\nMas gratuito não significa sem limites: nós custeamos a infraestrutura essencial ...")
            Text("Para mais detalhes dos nossos custos acesse aqui")
            Text("Seção 2 – Por que existem planos pagos").font(.headline)
            Text("Com os planos Basic, Plus e Pro, conseguimos: financiar a infraestrutura, investir em novas funcionalidades, garantir estabilidade ...")
            Text("Para mais detalhes dos nossos custos acesse aqui")
            Text("Seção 3 – Nossos Custos").font(.headline)
            Text("Manter o aplicativo envolve custos reais, que crescem a cada novo usuário: servidores e banco de dados; APIs e integrações; IA; desenvolvimento; suporte...")
        }.padding(16) }
        .navigationTitle("Por que cobramos?")
    }
}

struct CostsExplainedView: View {
    var body: some View {
        ScrollView { VStack(alignment: .leading, spacing: 12) {
            Text("Custos Explicados").font(.title3).bold()
            Text("Queremos ser 100% transparentes sobre como utilizamos o dinheiro das assinaturas ...")
            Text("* Valores variam conforme o volume de usuários ... Firebase Pricing | OpenAI Pricing")
            Text("Trabalho Independente & Comunidade").font(.headline)
            Text("Este projeto é desenvolvido de forma independente ...")
            Text("Como isso afeta os planos").font(.headline)
            Text("Plano Free ... Plano Basic ... Plano Plus ... Plano Pro ...")
            Text("Reinvestindo em Todos").font(.headline)
            Text("Nenhum valor é retirado como lucro pessoal ...")
        }.padding(16) }
        .navigationTitle("Custos")
    }
}

#Preview("PlanCardView") {
    PlanCardView(plan: subscriptionPlans.first!)
        .previewLayout(.sizeThatFits)
        .padding()
}

#Preview("FeatureTableView") {
    FeatureTableView()
        .padding()
}

#Preview("SubscriptionsPlansView") {
    SubscriptionsPlansView()
}

#Preview("WhyWeChargeView") {
    WhyWeChargeView()
}

#Preview("CostsExplainedView") {
    CostsExplainedView()
}
