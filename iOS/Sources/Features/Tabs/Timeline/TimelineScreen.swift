//
//  TimelineScreen.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 09/01/24.
//

import SwiftUI

struct TimelineScreen: View {
    @EnvironmentObject var repos: RepositoriesProvider
    @StateObject private var viewModel = TimelineViewModel()
    @State private var showAccountPicker = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Text("Timeline")
                    .font(.title2)
                    .bold()
                Spacer()
                // Account filter trigger
                Button(action: { showAccountPicker = true }) {
                    if let account = viewModel.selectedAccount {
                        Text(account.name)
                            .font(.subheadline)
                    } else {
                        Text("Selecionar conta")
                            .font(.subheadline)
                    }
                }
            }
            .padding(.horizontal)

            // Month navigation
            HStack {
                Button(action: viewModel.prevMonth) {
                    Image(systemName: "chevron.left")
                }
                Spacer()
                VStack(spacing: 2) {
                    Text(viewModel.currentMonthName)
                        .font(.headline)
                    Text(viewModel.periodLabel)
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                Spacer()
                Button(action: viewModel.nextMonth) {
                    Image(systemName: "chevron.right")
                }
            }
            .padding(.horizontal)

            // Search
            SearchBar(text: $viewModel.searchText, onChange: { newValue in
                viewModel.applyFilters()
            })

            // List
            List(viewModel.filteredRegistries, id: \.id) { item in
                TimelineItemRow(description: item.description, value: item.value)
            }
            .listStyle(.plain)
        }
        .sheet(isPresented: $showAccountPicker) {
            AccountPickerSheet(viewModel: viewModel, isPresented: $showAccountPicker)
        }
        .onAppear { viewModel.load(provider: repos) }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

private struct TimelineItemRow: View {
    let description: String
    let value: Double

    var body: some View {
        HStack {
            Text(description)
            Spacer()
            Text(value, format: .currency(code: "BRL"))
                .foregroundColor(value >= 0 ? .green : .red)
        }
        .padding(.vertical, 6)
    }
}

private struct AccountPickerSheet: View {
    @ObservedObject var viewModel: TimelineViewModel
    @Binding var isPresented: Bool

    var body: some View {
        NavigationStack {
            List(viewModel.accounts, id: \.id) { account in
                let logo = viewModel.bankLogo(for: account)
                Button(action: {
                    viewModel.selectedAccount = account
                    viewModel.applyFilters()
                    isPresented = false
                }) {
                    BankInfo(bank: Bank(name: account.name, logoUrl: logo))
                }
            }
            .navigationTitle("Contas")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Limpar") {
                        viewModel.selectedAccount = nil
                        viewModel.applyFilters()
                        isPresented = false
                    }
                }
            }
            .onAppear { viewModel.loadAccountsIfNeeded() }
        }
    }
}

private class TimelineViewModel: ObservableObject {
    // Input state
    @Published var searchText: String = ""
    @Published var selectedAccount: Account? = nil

    // Data
    @Published var accounts: [Account] = []
    @Published var allRegistries: [AccountsRegistry] = []
    @Published var filteredRegistries: [AccountsRegistry] = []

    // Month period
    @Published private var currentMonth: Date = Date()

    private var provider: RepositoriesProvider?

    func load(provider: RepositoriesProvider?) {
        self.provider = provider
        loadAccountsIfNeeded()
        loadRegistries()
    }

    func loadAccountsIfNeeded() {
        if !accounts.isEmpty { return }
        // Warm banks cache so logos resolve in the selector
        provider?.loadBanks(forceCache: false) { [weak self] _ in
            self?.provider?.loadAccounts { accounts in self?.accounts = accounts }
        }
    }

    func loadRegistries() {
        provider?.loadAccountsRegistries { [weak self] regs in
            self?.allRegistries = regs
            self?.applyFilters()
        }
    }

    var currentMonthName: String {
        let fmt = DateFormatter()
        fmt.locale = Locale(identifier: "pt_BR")
        fmt.dateFormat = "LLLL yyyy"
        return fmt.string(from: startOfPeriod(for: currentMonth)).capitalized
    }

    var periodLabel: String {
        let fmt = DateFormatter()
        fmt.locale = Locale(identifier: "pt_BR")
        fmt.dateStyle = .short
        let (start, end) = monthPeriod(for: currentMonth)
        return "\(fmt.string(from: start)) - \(fmt.string(from: end))"
    }

    func prevMonth() { currentMonth = addMonths(-1, to: currentMonth); applyFilters() }
    func nextMonth() { currentMonth = addMonths(1, to: currentMonth); applyFilters() }

    func applyFilters() {
        let (start, end) = monthPeriod(for: currentMonth)
        let search = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let selectedId = selectedAccount?.id ?? nil

        filteredRegistries = allRegistries
            .filter { reg in
                // period filter
                (reg.date >= start && reg.date <= end) &&
                // account filter
                (selectedId == nil || reg.accountId == selectedId) &&
                // search filter
                (search.isEmpty || reg.description.lowercased().contains(search))
            }
            .sorted { $0.date > $1.date }
    }

    func bankLogo(for account: Account) -> String { provider?.bankById(account.bankId)?.logoUrl ?? "" }

    // MARK: - Date helpers with cut-off day
    private var cutOffDay: Int { max(1, min(28, UserDefaults.standard.integer(forKey: "financeDay"))) }
    private func startOfPeriod(for date: Date) -> Date {
        let cal = Calendar.current
        var comp = cal.dateComponents([.year, .month, .day], from: date)
        // If day < cutOff, move to previous month
        if (comp.day ?? 1) < cutOffDay {
            if let prev = cal.date(byAdding: .month, value: -1, to: date) {
                comp = cal.dateComponents([.year, .month], from: prev)
            }
        }
        comp.day = cutOffDay; comp.hour = 0; comp.minute = 0; comp.second = 0
        return cal.date(from: comp) ?? date
    }
    private func endOfPeriod(for date: Date) -> Date {
        let cal = Calendar.current
        let start = startOfPeriod(for: date)
        if let nextStart = cal.date(byAdding: .month, value: 1, to: start),
           let end = cal.date(byAdding: .second, value: -1, to: nextStart) {
            return end
        }
        return date
    }
    private func monthPeriod(for date: Date) -> (Date, Date) {
        (startOfPeriod(for: date), endOfPeriod(for: date))
    }
    private func addMonths(_ m: Int, to date: Date) -> Date {
        Calendar.current.date(byAdding: .month, value: m, to: date) ?? date
    }
}

#Preview {
    TimelineScreen()
        .environmentObject(RepositoriesProvider(uid: "preview")!)
}
