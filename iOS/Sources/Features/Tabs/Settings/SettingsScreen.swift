import SwiftUI
import FirebaseFirestore

struct SettingsScreen: View {
    @EnvironmentObject var repos: RepositoriesProvider
    let authManager: AuthenticationManager
    @AppStorage("appTheme") private var appThemeRaw: String = AppTheme.system.rawValue
    @AppStorage("financeMode") private var financeMode: String = "start" // start | next
    @AppStorage("financeDay") private var financeDay: Int = 1
    @State private var showingShare = false
    @State private var exportURL: URL? = nil
    @State private var isExporting = false
    @State private var showResourceUsage = false

    var body: some View {
        NavigationStack {
            List {
                // Quick access
                Section("Gestão Financeira") {
                    NavigationLink("Contas") { AccountsScreen() }
                    NavigationLink("Cartões de crédito") { CreditCardsScreen() }
                    NavigationLink("Categorias") { Text("Categorias") }
                }

                // Preferences (Timeline)
                Section("Preferências") {
                    Picker("Modo do período", selection: $financeMode) {
                        Text("Início do mês").tag("start")
                        Text("Próximo mês").tag("next")
                    }
                    Picker("Dia de corte", selection: $financeDay) {
                        ForEach(1...28, id: \.self) { d in
                            Text("\\(d)").tag(d)
                        }
                    }
                }

                // Appearance
                Section(String(localized: "settings.theme")) {
                    Picker("Tema", selection: $appThemeRaw) {
                        ForEach(AppTheme.allCases) { theme in
                            Text(theme.localizedName).tag(theme.rawValue)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                // My Data
                Section("Meus Dados") {
                    Button("Ver uso de recursos") { showResourceUsage = true }
                    Button(isExporting ? "Exportando..." : "Exportar dados") {
                        exportData()
                    }
                    .disabled(isExporting)
                    Button(String(localized: "settings.signOut")) {
                        authManager.logOut()
                    }
                }

                // Beta
                Section("Beta") {
                    NavigationLink("Subscriptions (Only Informative)") { SubscriptionsPlansInline() }
                }

                // Dev-only
                #if DEBUG
                Section("Dev") {
                    Button("Limpar caches locais") { clearLocalCaches() }
                }
                #endif
            }
            .navigationTitle(String(localized: "settings.title"))
            .sheet(isPresented: $showResourceUsage) {
                ResourceUsageScreen()
            }
            .sheet(isPresented: $showingShare) {
                if let url = exportURL {
                    ShareSheet(activityItems: [url])
                }
            }
        }
    }

    private func exportData() {
        isExporting = true
        let group = DispatchGroup()

        var banks: [Bank] = []
        var categories: [Category] = []
        var accounts: [Account] = []
        var creditCards: [CreditCard] = []
        var accountsRegistries: [AccountsRegistry] = []
        let creditCardRegistries: [CreditCardRegistry] = []
        let creditCardInvoices: [CreditCardInvoice] = []

        group.enter(); repos.loadBanks(forceCache: true) { banks = $0; group.leave() }
        group.enter(); repos.loadCategories { categories = $0; group.leave() }
        group.enter(); repos.loadAccounts { accounts = $0; group.leave() }
        group.enter(); repos.loadCreditCards { creditCards = $0; group.leave() }
        group.enter(); repos.loadAccountsRegistries { accountsRegistries = $0; group.leave() }

        group.notify(queue: .main) {
            struct ExportBundle: Codable {
                let banks: [Bank]
                let categories: [Category]
                let accounts: [Account]
                let creditCards: [CreditCard]
                let accountsRegistries: [AccountsRegistry]
                let creditCardRegistries: [CreditCardRegistry]
                let creditCardInvoices: [CreditCardInvoice]
            }
            let bundle = ExportBundle(
                banks: banks,
                categories: categories,
                accounts: accounts,
                creditCards: creditCards,
                accountsRegistries: accountsRegistries,
                creditCardRegistries: creditCardRegistries,
                creditCardInvoices: creditCardInvoices
            )
            do {
                let data = try JSONEncoder().encode(bundle)
                let url = FileManager.default.temporaryDirectory.appendingPathComponent("exported_data.json")
                try data.write(to: url)
                exportURL = url
                showingShare = true
            } catch {
                print("Export error: \(error)")
            }
            isExporting = false
        }
    }

    private func clearLocalCaches() {
        let db = Firestore.firestore()
        db.terminate { _ in
            db.clearPersistence { _ in }
        }
        // Clear repository last update keys
        let defaults = UserDefaults.standard
        for (key, _) in defaults.dictionaryRepresentation() {
            if key.lowercased().contains("last") && key.lowercased().contains("update") {
                defaults.removeObject(forKey: key)
            }
        }
    }
}

private struct ShareSheet: UIViewControllerRepresentable {
    var activityItems: [Any]
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

// Inline subscriptions view to avoid project wiring issues
private struct SubscriptionsPlansInline: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack {
                        ForEach(subscriptionPlans) { plan in
                            VStack(alignment: .leading, spacing: 8) {
                                if let badge = plan.badge { Text(badge).foregroundColor(.blue).font(.footnote) }
                                Text(plan.title).font(.title3).bold()
                                Text(plan.price).font(.headline)
                                Text(plan.description)
                                VStack(alignment: .leading, spacing: 4) { ForEach(plan.bullets, id: \.self) { Text("• \($0)") } }
                                Button(plan.cta) {}
                            }
                            .padding(16)
                            .frame(maxWidth: 280)
                            .background((plan.highlighted ? Color.blue.opacity(0.08) : Color.black.opacity(0.05)))
                            .cornerRadius(12)
                            .padding(.trailing, 8)
                        }
                    }.padding(.horizontal, 8)
                }
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
                Text(transparencyNoteText)
            }.padding(16)
        }.navigationTitle("Assinaturas")
    }
}

struct ResourceUsageScreen: View {
    @Environment(\.dismiss) var dismiss
    @EnvironmentObject var repos: RepositoriesProvider
    @State private var summary: [(String, Int)] = []

    var body: some View {
        NavigationStack {
            List(summary, id: \.0) { item in
                HStack { Text(item.0); Spacer(); Text("\\(item.1)") }
            }
            .navigationTitle("Uso de recursos")
            .toolbar { ToolbarItem(placement: .navigationBarTrailing) { Button("Fechar") { dismiss() } } }
            .onAppear { load() }
        }
    }

    private func load() {
        repos.loadBanks(forceCache: true) { banks in self.summary.append(("Bancos", banks.count)) }
        repos.loadCategories { cats in self.summary.append(("Categorias", cats.count)) }
        repos.loadAccounts { accs in self.summary.append(("Contas", accs.count)) }
        repos.loadCreditCards { cards in self.summary.append(("Cartões", cards.count)) }
        repos.loadAccountsRegistries { regs in self.summary.append(("Lançamentos Conta", regs.count)) }
        // Ainda não exposto no provider
        self.summary.append(("Lançamentos Cartão", 0))
        self.summary.append(("Faturas", 0))
    }
}

#Preview {
    SettingsScreen(authManager: AuthenticationManager())
}
