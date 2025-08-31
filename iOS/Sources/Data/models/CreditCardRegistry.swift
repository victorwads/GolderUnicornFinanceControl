import Foundation

struct CreditCardRegistry: Codable, Identifiable {
    var id: String?
    var type: RegistryType = .credit
    var cardId: String
    var invoiceId: String?
    var value: Double
    var description: String
    var date: Date
    var paid: Bool
    var tags: [String]
    var categoryId: String?
    var observation: String?
    var relatedInfo: String?
}
