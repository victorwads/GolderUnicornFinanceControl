import Foundation
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

