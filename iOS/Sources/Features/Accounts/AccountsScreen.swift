import SwiftUI

struct AccountsScreen: View {
    @StateObject private var viewModel = AccountsCardViewModel()

    var body: some View {
        List {
            ForEach(viewModel.accounts) { account in
                BankInfo(bank: Bank(
                    name: account.name,
                    logoUrl: viewModel.getLogo(account: account)
                ))
            }
            if viewModel.accounts.isEmpty {
                Text("Nenhuma conta")
            }
            NavigationLink("Adicionar Conta", value: Route.createAccount)
        }
        .navigationTitle("Contas")
        .onAppear {
            viewModel.load()
        }
    }
}

#Preview {
    AccountsScreen()
        .environmentObject(Router())
}
