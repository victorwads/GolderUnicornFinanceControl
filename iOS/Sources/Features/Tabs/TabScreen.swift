//
//  TabScreen.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 09/01/24.
//

import SwiftUI

struct TabsScreen: View {

    let authManager: AuthenticationManager
    @EnvironmentObject var router: Router

    var body: some View {
        TabView(selection: $router.selectedTab) {
            NavigationStack(path: $router.path) {
                DashboardScreen(authManager: authManager)
                    .navigationDestination(for: Route.self) { route in
                        switch route {
                        case .accounts:
                            AccountsScreen()
                        case .createAccount:
                            CreateAccountScreen()
                        case .creditCards:
                            CreditCardsScreen()
                        case .createCreditCard:
                            CreateCreditCardsScreen()
                        }
                    }
            }
            .tabItem {
                Label("tabs.dashboard", systemImage: "square.on.square.dashed")
            }
            .tag(AppTab.dashboard)

            NavigationStack {
                TimelineScreen()
            }
            .tabItem {
                Label("tabs.timeline", systemImage: "list.dash")
            }
            .tag(AppTab.timeline)

            NavigationStack {
                SettingsScreen(authManager: authManager)
            }
            .tabItem {
                Label("tabs.settings", systemImage: "gearshape")
            }
            .tag(AppTab.settings)
        }
    }
}

#Preview {
    TabsScreen(authManager: AuthenticationManager())
        .environmentObject(Router())
}
