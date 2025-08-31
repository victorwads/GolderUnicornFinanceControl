import SwiftUI
import FirebaseFirestore

struct SettingsScreen: View {
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
                    NavigationLink("Subscriptions (Only Informative)") { Text("Subscriptions") }
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
        var creditCardRegistries: [CreditCardRegistry] = []
        var creditCardInvoices: [CreditCardInvoice] = []

        let banksRepo = BanksRepository()
        let categoriesRepo = CategoriesRepository()
        let accountsRepo = AccountsRepository()
        let creditCardsRepo = CreditCardsRepository()
        let accRegsRepo = AccountsRegistryRepository()
        let ccRegsRepo = CreditCardsRegistryRepository()
        let ccInvRepo = CreditCardInvoicesRepository()

        group.enter(); banksRepo.getAll(forceCache: true) { banks = $0; group.leave() }
        group.enter(); categoriesRepo.getAll { cats in categories = cats; group.leave() }
        group.enter(); accountsRepo.getAll { accounts = $0; group.leave() }
        group.enter(); creditCardsRepo.getAll { creditCards = $0; group.leave() }
        group.enter(); accRegsRepo.getAll { accountsRegistries = $0; group.leave() }
        group.enter(); ccRegsRepo.getAll { creditCardRegistries = $0; group.leave() }
        group.enter(); ccInvRepo.getAll { creditCardInvoices = $0; group.leave() }

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

struct ResourceUsageScreen: View {
    @Environment(\.dismiss) var dismiss
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
        let banksRepo = BanksRepository(); banksRepo.getAll(forceCache: true) { banks in
            self.summary.append(("Bancos", banks.count))
        }
        let categoriesRepo = CategoriesRepository(); categoriesRepo.getAll { cats in
            self.summary.append(("Categorias", cats.count))
        }
        let accountsRepo = AccountsRepository(); accountsRepo.getAll { accs in
            self.summary.append(("Contas", accs.count))
        }
        let creditCardsRepo = CreditCardsRepository(); creditCardsRepo.getAll { cards in
            self.summary.append(("Cartões", cards.count))
        }
        let accRegsRepo = AccountsRegistryRepository(); accRegsRepo.getAll { regs in
            self.summary.append(("Lançamentos Conta", regs.count))
        }
        let ccRegsRepo = CreditCardsRegistryRepository(); ccRegsRepo.getAll { regs in
            self.summary.append(("Lançamentos Cartão", regs.count))
        }
        let ccInvRepo = CreditCardInvoicesRepository(); ccInvRepo.getAll { invs in
            self.summary.append(("Faturas", invs.count))
        }
    }
}

#Preview {
    SettingsScreen(authManager: AuthenticationManager())
}
