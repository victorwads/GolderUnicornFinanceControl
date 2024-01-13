struct Bank: Codable {
    var id: String?
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
