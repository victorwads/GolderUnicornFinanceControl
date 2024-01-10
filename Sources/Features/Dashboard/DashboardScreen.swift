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
        VStack {
            Text("DashboardScreen").padding()
            
            let user = authManager.auth.currentUser
            Text("Olá, \(user?.displayName ?? "") - \(user?.email ?? "")")
            Button("Logout") {
                authManager.logOut()
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity)
            .background(.white)
            .cornerRadius(5)
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
