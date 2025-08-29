//
//  CreditCardsCard.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 17/01/24.
//

import SwiftUI

struct CreditCardsCard: View {
    
    @ObservedObject var viewModel = CreditCardsCardViewModel()
    
    var body: some View {
        Text("Cartões")
        Card {
            BankInfo(bank: Bank(name: "Test Card", logoUrl: "amazonia.png"))
            BankInfo(bank: Bank(name: "Test Card", logoUrl: "ame-1.png"))
            BankInfo(bank: Bank(name: "Test Card", logoUrl: "neon.png"))
            HStack {
                Spacer()
                Button(action: {}) {
                    Text("Adicionar Cartão")
                }.disabled(true)
            }
        }
    }
}

class CreditCardsCardViewModel: ObservableObject {
    
    @Published var creditCards: [String] = []
    
}
