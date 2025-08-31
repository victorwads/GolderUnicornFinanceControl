import Foundation

class DocumentModel: Codable, Identifiable {
    var id: String
    var createdAt: Date = Date()
    var updatedAt: Date = Date()

    init(id: String) {
        self.id = id
    }
}
