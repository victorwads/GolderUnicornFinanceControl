import Foundation

struct AccountsRegistry: Codable, Identifiable {
    var id: String?
    var type: RegistryType = .account
    var accountId: String
    var value: Double
    var description: String
    var date: Date
    var paid: Bool
    var tags: [String]
    var categoryId: String?
    var observation: String?
    var relatedInfo: String?
}
