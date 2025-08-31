import Foundation
import SwiftUI

/// Tabs available in the application
enum AppTab: Hashable {
    case dashboard
    case timeline
    case settings
}

/// All screens that can be reached through navigation
enum Route: Hashable {
    case accounts
    case createAccount
    case creditCards
    case createCreditCard
}

/// Global router responsible for handling navigation and deep links
final class Router: ObservableObject {
    /// Currently selected tab
    @Published var selectedTab: AppTab = .dashboard
    /// Navigation path for stack based navigation inside the selected tab
    @Published var path: NavigationPath = NavigationPath()

    /// Navigate to a specific route
    func navigate(to route: Route) {
        path.append(route)
    }

    /// Basic deep link handler using the custom `gufc://` scheme
    func handle(url: URL) {
        guard url.scheme == "gufc" else { return }
        switch url.host {
        case "accounts":
            selectedTab = .dashboard
            path.removeLast(path.count)
            path.append(Route.accounts)
        case "creditcards":
            selectedTab = .dashboard
            path.removeLast(path.count)
            path.append(Route.creditCards)
        case "settings":
            selectedTab = .settings
            path.removeLast(path.count)
        default:
            break
        }
    }
}

