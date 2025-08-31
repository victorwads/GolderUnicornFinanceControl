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
        VStack(alignment: .leading, spacing: 16) {
            let user = authManager.auth.currentUser
            Text("Olá, \(user?.displayName ?? "") - \(user?.email ?? "")")

            NavigationLink(value: Route.accounts) {
                AccountsCard()
            }
            NavigationLink(String(localized: "dashboard.addAccount"), value: Route.createAccount)
                .font(.footnote)

            NavigationLink(value: Route.creditCards) {
                CreditCardsCard()
            }
            NavigationLink(String(localized: "dashboard.addCreditCard"), value: Route.createCreditCard)
                .font(.footnote)

            Text(String(localized: "dashboard.otherThings"))
            Card {
                Text(String(localized: "dashboard.todoIdeas"))
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    DashboardScreen(authManager: AuthenticationManager())
}
