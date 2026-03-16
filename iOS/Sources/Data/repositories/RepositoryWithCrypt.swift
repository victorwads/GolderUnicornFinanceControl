import Foundation

class RepositoryWithCrypt<Model: Codable & Identifiable>: RepositoryBase<Model> where Model.ID == String? {
    let encryptor: Encryptor

    init(collectionPath: String, encryptor: Encryptor, cacheDuration: TimeInterval = 2_592_000) {
        self.encryptor = encryptor
        super.init(collectionPath: collectionPath, cacheDuration: cacheDuration)
    }
}

