//
//  ContentView.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 07/01/24.
//

import _AuthenticationServices_SwiftUI
import FirebaseAuth
import GoogleSignInSwift
import SwiftUI

struct MainContentView: View {

    @ObservedObject var authManager = AuthenticationManager()

    var body: some View {
        VStack {
            if authManager.loggedUser {
                TabsScreen(authManager: authManager)
            } else {
                LoginScreen(authManager: authManager)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(hex: 0x282C34))
    }
}

#Preview {
    MainContentView()
}
