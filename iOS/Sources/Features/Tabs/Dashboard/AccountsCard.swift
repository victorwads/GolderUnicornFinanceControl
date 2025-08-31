//
//  AccountsCard.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 17/01/24.
//

import SwiftUI

struct AccountsCard: View {
    @EnvironmentObject var repos: RepositoriesProvider
    @StateObject var viewModel = AccountsCardViewModel()

    var body: some View {
        Text("Contas")
        Card {
            ForEach(viewModel.accounts) { account in
                let logo = repos.bankById(account.bankId)?.logoUrl ?? ""
                BankInfo(bank: Bank(
                    name: account.name,
                    logoUrl: logo
                ))
                .accessibilityIdentifier("AccountCard.\(account.id ?? "unknown")")
            }
            if(viewModel.accounts.isEmpty) {
                Text("Nenhuma conta")
            }
        }
        .accessibilityIdentifier("Dashboard.Accounts.List")
        .onAppear { viewModel.load(provider: repos) }
    }
}

struct DashAccount {
    let account: Account
    let bank: Bank
}

class AccountsCardViewModel: ObservableObject {
    @Published var accounts: [Account] = []

    func load(provider: RepositoriesProvider?) {
        guard let provider else { return }
        provider.loadBanks(forceCache: false) { _ in
            provider.loadAccounts { accounts in
                self.accounts = accounts
            }
        }
    }

    func getLogo(account: Account) -> String { "" }
}
