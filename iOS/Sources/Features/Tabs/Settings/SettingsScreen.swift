import SwiftUI

struct SettingsScreen: View {
    let authManager: AuthenticationManager
    @AppStorage("appTheme") private var appThemeRaw: String = AppTheme.system.rawValue

    var body: some View {
        NavigationStack {
            Form {
                Section(String(localized: "settings.theme")) {
                    Picker("", selection: $appThemeRaw) {
                        ForEach(AppTheme.allCases) { theme in
                            Text(theme.localizedName).tag(theme.rawValue)
                        }
                    }
                    .pickerStyle(.segmented)
                }
                Section {
                    Button(String(localized: "settings.signOut")) {
                        authManager.logOut()
                    }
                }
            }
            .navigationTitle(String(localized: "settings.title"))
        }
    }
}

#Preview {
    SettingsScreen(authManager: AuthenticationManager())
}

