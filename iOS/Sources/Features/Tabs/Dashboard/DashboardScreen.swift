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
            
            AccountsCard()
            CreditCardsCard()
            Text("Outras coisas")
            Card {
                Text("ToDo Ideias")
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    DashboardScreen(authManager: AuthenticationManager())
}
