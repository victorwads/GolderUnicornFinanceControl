
import Foundation
import FirebaseFirestore

struct DebitRegistry: Codable, Identifiable {
    @DocumentID var id: String? = nil
    var bankId: String
    var categoryId: String

    var name: String = ""
    var amount: Double = 0
    var date: Date = Date()
    var type: Type = .default
    var done: Bool = false

    var metadata: Metadata = Metadata()
    var createdAt: Date = Date()
    var updatedAt: Date = Date()
    
    enum CodingKeys: String, CodingKey {
        case id
        case bankId = "bankId"
        case categoryId = "categoryId"
        
        case name = "name"
        case amount = "amount"
        case date = "date"
        case type = "type"
        case done = "done"
        
        case metadata = "metadata"
        case createdAt = "createdAt"
        case updatedAt = "updatedAt"
    }
    
    enum `Type`: String, Codable {
        case `default` = "DEFAULT"
        case fixed = "FIXED"
    }
    
    struct Metadata: Codable {
        var fixedBillId: String? = nil
        
        enum CodingKeys: String, CodingKey {
            case fixedBillId = "fixedBillId"
        }
    }
}
