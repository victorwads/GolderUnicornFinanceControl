import SwiftUI

struct CreditCardsScreen: View {
    var body: some View {
        List {
            BankInfo(bank: Bank(name: "Cartão Exemplo", logoUrl: "amazonia.png"))
            BankInfo(bank: Bank(name: "Cartão Exemplo", logoUrl: "ame-1.png"))
            NavigationLink("Adicionar Cartão", value: Route.createCreditCard)
        }
        .navigationTitle("Cartões")
    }
}

#Preview {
    CreditCardsScreen()
        .environmentObject(Router())
}
