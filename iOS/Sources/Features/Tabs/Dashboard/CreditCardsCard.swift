//
//  CreditCardsCard.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 17/01/24.
//

import SwiftUI

struct CreditCardsCard: View {
    @EnvironmentObject var repos: RepositoriesProvider
    @StateObject var viewModel = CreditCardsCardViewModel()
    
    var body: some View {
        Text("Cartões")
        Card {
            ForEach(viewModel.creditCards, id: \.id) { card in
                let logo = card.brand.lowercased() + ".png"
                BankInfo(bank: Bank(name: card.name, logoUrl: logo))
                    .accessibilityIdentifier("CreditCardCard.\(card.id ?? "unknown")")
            }
            if viewModel.creditCards.isEmpty {
                Text("Nenhum Cartão")
            }
        }
        .accessibilityIdentifier("Dashboard.CreditCards.List")
        .onAppear { viewModel.load(provider: repos) }
    }
}

class CreditCardsCardViewModel: ObservableObject {
    
    @Published var creditCards: [CreditCard] = []
    func load(provider: RepositoriesProvider?) {
        provider?.loadCreditCards { self.creditCards = $0 }
    }
    
}
