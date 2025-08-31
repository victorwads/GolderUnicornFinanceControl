//
//  TimelineScreen.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 09/01/24.
//

import SwiftUI

struct TimelineScreen: View {
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
        .onAppear { viewModel.load() }
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

    // Repositories
    private let accountsRepo = AccountsRepository()
    private let banksRepo = BanksRepository()
    private let registriesRepo = AccountsRegistryRepository()

    func load() {
        loadAccountsIfNeeded()
        loadRegistries()
    }

    func loadAccountsIfNeeded() {
        if !accounts.isEmpty { return }
        // Warm banks cache so logos resolve in the selector
        banksRepo.getAll(forceCache: false) { [weak self] _ in
            self?.accountsRepo.getAll { accounts in
                self?.accounts = accounts
            }
        }
    }

    func loadRegistries() {
        registriesRepo.getAll { [weak self] regs in
            self?.allRegistries = regs
            self?.applyFilters()
        }
    }

    var currentMonthName: String {
        let fmt = DateFormatter()
        fmt.locale = Locale(identifier: "pt_BR")
        fmt.dateFormat = "LLLL yyyy"
        return fmt.string(from: startOfMonth(for: currentMonth)).capitalized
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

    func bankLogo(for account: Account) -> String {
        banksRepo.getById(bankId: account.bankId)?.logoUrl ?? ""
    }

    // MARK: - Date helpers
    private func startOfMonth(for date: Date) -> Date {
        let calendar = Calendar.current
        let comp = calendar.dateComponents([.year, .month], from: date)
        return calendar.date(from: comp) ?? date
    }
    private func endOfMonth(for date: Date) -> Date {
        let cal = Calendar.current
        if let start = cal.date(from: cal.dateComponents([.year, .month], from: date)),
           let next = cal.date(byAdding: DateComponents(month: 1, day: -1), to: start) {
            return cal.date(bySettingHour: 23, minute: 59, second: 59, of: next) ?? next
        }
        return date
    }
    private func monthPeriod(for date: Date) -> (Date, Date) {
        (startOfMonth(for: date), endOfMonth(for: date))
    }
    private func addMonths(_ m: Int, to date: Date) -> Date {
        Calendar.current.date(byAdding: .month, value: m, to: date) ?? date
    }
}

#Preview {
    TimelineScreen()
}
