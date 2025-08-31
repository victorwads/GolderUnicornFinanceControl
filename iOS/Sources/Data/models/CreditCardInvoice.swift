import Foundation

struct CreditCardInvoice: Codable, Identifiable {
    var id: String?
    var cardId: String
    var invoiceDate: Date
    var year: Int
    var month: Int
    var value: Double
    var paymentDate: Date?
    var paymentAccountId: String?
    var paidValue: Double?
    var importInfo: String?

    var name: String {
        String(format: "%04d%02d", year, month)
    }

    var paid: Bool {
        paymentDate != nil && paymentAccountId != nil && paidValue != nil
    }

    static func nowName() -> String {
        let now = Date()
        let calendar = Calendar.current
        let year = calendar.component(.year, from: now)
        let month = calendar.component(.month, from: now)
        return String(format: "%04d%02d", year, month)
    }
}
