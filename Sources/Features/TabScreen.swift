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
            DashboardScreen(authManager: authManager).tabItem {
                Label("Dash", systemImage: "square.on.square.dashed")
            }
            TimelineScreen().tabItem {
                Label("Timeline", systemImage: "list.dash")
            }
            SettingsScreen().tabItem {
                Label("Configurações", systemImage: "gearshape")
            }
        }
    }
}

#Preview {
    TabsScreen(authManager: AuthenticationManager())
}
