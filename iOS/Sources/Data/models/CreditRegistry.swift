
import Foundation
import FirebaseFirestore

struct CreditRegistry: Codable, Identifiable {
    @DocumentID var id: String? = nil
    var cardId: String
    var categoryId: String
    var invoice: String

    var name: String = ""
    var amount: Double = 0
    var date: Date = Date()
    var type: Type = .default

    var metadata: Metadata = Metadata()
    var createdAt: Date = Date()
    var updatedAt: Date = Date()
    
    enum CodingKeys: String, CodingKey {
        case id
        case cardId = "cardId"
        case categoryId = "categoryId"
        case invoice = "invoice"

        case name = "name"
        case amount = "amount"
        case date = "date"
        case type = "type"
        case metadata = "metadata"

        case createdAt = "createdAt"
        case updatedAt = "updatedAt"
    }

    enum `Type`: String, Codable {
        case `default` = "DEFAULT"
        case fixed = "FIXED"
        case installment = "INSTALLMENT"
    }

    struct Metadata: Codable {
        var installmentBillId: String? = nil
        var fixedBillId: String? = nil

        enum CodingKeys: String, CodingKey {
            case installmentBillId = "installmentBillId"
            case fixedBillId = "fixedBillId"
        }
    }
}
