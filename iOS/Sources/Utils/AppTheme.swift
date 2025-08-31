import SwiftUI

enum AppTheme: String, CaseIterable, Identifiable {
    case system
    case light
    case dark

    var id: String { rawValue }

    var colorScheme: ColorScheme? {
        switch self {
        case .system: return nil
        case .light: return .light
        case .dark: return .dark
        }
    }

    var localizedName: LocalizedStringResource {
        switch self {
        case .system: return LocalizedStringResource("settings.theme.system")
        case .light: return LocalizedStringResource("settings.theme.light")
        case .dark: return LocalizedStringResource("settings.theme.dark")
        }
    }
}
