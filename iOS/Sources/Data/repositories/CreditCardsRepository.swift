import Foundation
import FirebaseFirestore
import FirebaseAuth
import FirebaseCrashlytics

class CreditCardsRepository: RepositoryBase<CreditCard> {

    init(userId: String? = nil) {
        guard let userId = userId ?? Auth.auth().currentUser?.uid else {
            let error = NSError(domain: "Auth", code: 401, userInfo: [NSLocalizedDescriptionKey: "Invalid userId"])
            Crashlytics.crashlytics().record(error: error)
            fatalError(error.localizedDescription)
        }
        super.init(collectionPath: "\(Collections.Users)/\(userId)/\(Collections.CreditCards)")
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
                card.name = CryptoService.shared.decryptStringIfNeeded(raw["name"] as? String ?? "")
                card.brand = CryptoService.shared.decryptStringIfNeeded(raw["brand"] as? String ?? "")
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
