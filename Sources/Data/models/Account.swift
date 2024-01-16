import Foundation
import FirebaseFirestoreSwift

enum AccountType: String, Codable {
    case current = "CURRENT"
    case savings = "SAVINGS"
    case creditCard = "CREDIT_CARD"
    case investment = "INVESTMENT"
}

struct Account: Codable, Identifiable {
    @DocumentID var id: String? = nil
    var name: String = ""
    var initialBalance: Double = 0
    var bankId: String? = nil
    var type: AccountType = .current
    var color: String? = nil
    var includeInDash: Bool = true
    var createdAt: Date = Date()
    var updatedAt: Date = Date()

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case initialBalance = "initialBalance"
        case bankId = "bankId"
        case type
        case color
        case includeInDash = "includeInDash"
        case createdAt = "createdAt"
        case updatedAt = "updatedAt"
    }
}
