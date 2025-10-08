import SwiftUI

struct AccountsScreen: View {
    @EnvironmentObject var repos: RepositoriesProvider
    @StateObject private var viewModel = AccountsCardViewModel()

    var body: some View {
        List {
            ForEach(viewModel.accounts) { account in
                BankInfo(bank: Bank(
                    name: account.name,
                    logoUrl: repos.bankById(account.bankId)?.logoUrl ?? ""
                ))
            }
            if viewModel.accounts.isEmpty {
                Text("Nenhuma conta")
            }
            NavigationLink("Adicionar Conta", value: Route.createAccount)
        }
        .navigationTitle("Contas")
        .onAppear { viewModel.load(provider: repos) }
    }
}

#Preview {
    AccountsScreen()
        .environmentObject(Router())
        .environmentObject(RepositoriesProvider(uid: "preview")!)
}
