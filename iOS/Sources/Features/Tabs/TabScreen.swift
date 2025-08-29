//
//  TabScreen.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 09/01/24.
//

import SwiftUI

struct TabsScreen: View {

    let authManager: AuthenticationManager

    var body: some View {
        TabView {
            NavigationView {
                ScrollView {
                    DashboardScreen(authManager: authManager)
                }
            }.navigationViewStyle(.stack)
            .tabItem {
                Label("Dash", systemImage: "square.on.square.dashed")
            }
            ScrollView {
                TimelineScreen()
            }.tabItem {
                Label("Timeline", systemImage: "list.dash")
            }
            ScrollView {
                SettingsScreen(authManager: authManager)
            }.tabItem {
                Label("Configurações", systemImage: "gearshape")
            }
        }
    }
}

#Preview {
    TabsScreen(authManager: AuthenticationManager())
}
