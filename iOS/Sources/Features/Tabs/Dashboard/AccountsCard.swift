//
//  AccountsCard.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 17/01/24.
//

import SwiftUI

struct AccountsCard: View {
    
    @ObservedObject var viewModel = AccountsCardViewModel()

    var body: some View {
        Text("Contas")
        Card {
            ForEach(viewModel.accounts) { account in
                BankInfo(bank: Bank(
                    name: account.name,
                    logoUrl: viewModel.getLogo(account: account) )
                )
            }
            if(viewModel.accounts.isEmpty) {
                Text("Nenhuma conta")
            }
        }.onAppear {
            viewModel.load()
        }
    }
}

struct DashAccount {
    let account: Account
    let bank: Bank
}

class AccountsCardViewModel: ObservableObject {
    
    @Published var accounts: [Account] = []
    
    private let banksRepository = BanksRepository()
    private let accountsRepository = AccountsRepository()
    
    func load() {
        accountsRepository.getAll { accounts in
            self.accounts = accounts
        }
    }
    
    func getLogo(account: Account) -> String {
        return banksRepository.getById(bankId: account.bankId)?.logoUrl ?? ""
    }
    
}
