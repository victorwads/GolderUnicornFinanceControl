//
//  DashboardScreen.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 09/01/24.
//

import SwiftUI

struct DashboardScreen: View {
    
    let authManager: AuthenticationManager

    var body: some View {
        VStack(alignment: .leading) {
            let user = authManager.auth.currentUser
            Text("Olá, \(user?.displayName ?? "") - \(user?.email ?? "")")
            
            Text("Contas")
            Card {
                BankInfo(bank: Bank(name: "Test Account", logoUrl: "mercadopago.png"))
                BankInfo(bank: Bank(name: "Test Account", logoUrl: "itau.png"))
                BankInfo(bank: Bank(name: "Test Account", logoUrl: "c6bank-2.png"))
                HStack {
                    Spacer()
                    NavigationLink("Adicionar Conta", destination: CreateAccountScreen())
                }
            }
            Text("Cartões")
            Card {
                BankInfo(bank: Bank(name: "Test Account", logoUrl: "amazonia.png"))
                BankInfo(bank: Bank(name: "Test Account", logoUrl: "ame-1.png"))
                BankInfo(bank: Bank(name: "Test Account", logoUrl: "neon.png"))
                HStack {
                    Spacer()
                    Button(action: {}) {
                        Text("Adicionar Cartão")
                    }.disabled(true)
                }
            }
            Text("Outras coisas")
            Card {
                Text("ToDo Ideias")
            }
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    DashboardScreen(authManager: AuthenticationManager())
}
