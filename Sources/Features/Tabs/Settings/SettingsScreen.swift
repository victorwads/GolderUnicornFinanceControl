//
//  SettingsScreen.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 09/01/24.
//

import SwiftUI

struct SettingsScreen: View {

    let authManager: AuthenticationManager

    var body: some View {
        VStack {
            Text("SettingsScreen")
            Button("Logout") {
                authManager.logOut()
            }

        }.frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
