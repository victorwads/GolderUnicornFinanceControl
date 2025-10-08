import Foundation
import FirebaseFirestore
import FirebaseCrashlytics

class CreditCardsRepository: RepositoryWithCrypt<CreditCard> {

    init(userId: String, encryptor: Encryptor) {
        super.init(collectionPath: "\(Collections.Users)/\(userId)/\(Collections.CreditCards)", encryptor: encryptor)
    }

    func getAll(neededSource: FirestoreSource? = nil, _ completion: @escaping ([CreditCard]) -> Void) {
        let source = neededSource ?? .default
        collectionRef.getDocuments(source: source) { snapshot, error in
            if let error = error {
                Crashlytics.crashlytics().record(error: error)
                completion([])
                return
            }
            var items: [CreditCard] = []
            snapshot?.documents.forEach { doc in
                let raw = doc.data()
                var card = CreditCard()
                card.id = doc.documentID
                card.name = self.encryptor.decryptStringIfNeeded(raw["name"] as? String ?? "")
                card.brand = self.encryptor.decryptStringIfNeeded(raw["brand"] as? String ?? "")
                items.append(card)
            }
            completion(items)
        }
    }

    func add(card: CreditCard, completion: @escaping (Bool) -> Void) {
        do {
            try collectionRef.addDocument(from: card) { e in
                completion(e == nil)
            }
        } catch {
            Crashlytics.crashlytics().record(error: error)
            completion(false)
        }
    }
}
