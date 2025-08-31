import Foundation

enum RegistryType: String, Codable {
    case account
    case accountRecurrent
    case credit
    case creditRecurrent
    case transfer
    case invoice
}

struct Registry: Codable, Identifiable {
    var id: String
    var type: RegistryType
    var paid: Bool
    var value: Double
    var description: String
    var date: Date
    var tags: [String]
    var categoryId: String?
    var observation: String?
    var relatedInfo: String?
}

struct RegistryWithDetails: Codable {
    var sourceName: String
    var registry: Registry
    var category: Category?
}
