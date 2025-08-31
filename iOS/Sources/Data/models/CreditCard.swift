import FirebaseFirestore

struct CreditCard: Codable, Identifiable {
    @DocumentID var id: String? = nil
    var name: String = ""
    var limit: Double = 0
    var brand: String = ""
    var accountId: String = ""
    var closingDay: Int = 1
    var dueDay: Int = 1
    var archived: Bool = false

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case limit
        case brand
        case accountId
        case closingDay
        case dueDay
        case archived
    }
}
