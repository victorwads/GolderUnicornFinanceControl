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
    @StateObject private var router = Router()
    @AppStorage("appTheme") private var appThemeRaw: String = AppTheme.system.rawValue

    var body: some View {
        VStack {
            if authManager.loggedUser {
                TabsScreen(authManager: authManager)
                    .environmentObject(router)
            } else {
                LoginScreen(authManager: authManager)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .preferredColorScheme(AppTheme(rawValue: appThemeRaw)?.colorScheme)
        .onOpenURL { url in
            router.handle(url: url)
        }
    }
}

#Preview {
    MainContentView()
}
