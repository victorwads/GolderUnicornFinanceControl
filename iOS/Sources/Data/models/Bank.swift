import FirebaseFirestoreSwift

struct Bank: Codable, Identifiable {
    @DocumentID var id: String? = nil
    var name: String
    var fullName: String = ""
    var logoUrl: String

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case fullName
        case logoUrl
    }
}
