import Foundation

enum AccountType: String, Codable {
    case current = "CURRENT"
    case savings = "SAVINGS"
    case creditCard = "CREDIT_CARD"
    case investment = "INVESTMENT"
}

struct Account: Codable {
    var id: String
    var name: String
    var initialBalance: Double
    var bankId: String
    var type: AccountType
    var color: String
    var includeInTotal: Bool
    var createdAt: Date
    var updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case initialBalance = "initial_balance"
        case bankId = "bank_id"
        case type
        case color
        case includeInTotal = "include_in_total"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
