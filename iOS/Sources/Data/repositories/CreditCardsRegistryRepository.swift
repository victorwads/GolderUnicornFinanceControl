import Foundation
import FirebaseAuth
import FirebaseFirestore
import FirebaseCrashlytics

class CreditCardsRegistryRepository: RepositoryBase<CreditCardRegistry> {
    init(userId: String? = nil) {
        guard let userId = userId ?? Auth.auth().currentUser?.uid else {
            let error = NSError(domain: "Auth", code: 401, userInfo: [NSLocalizedDescriptionKey: "Invalid userId"])
            Crashlytics.crashlytics().record(error: error)
            fatalError(error.localizedDescription)
        }
        super.init(collectionPath: "\(Collections.Users)/\(userId)/\(Collections.CreditCardRegistries)")
    }

    func addRegistry(_ registry: CreditCardRegistry, completion: @escaping (Bool) -> Void) {
        do {
            try collectionRef.addDocument(from: registry) { e in
                completion(e == nil)
            }
        } catch {
            Crashlytics.crashlytics().record(error: error)
            completion(false)
        }
    }

    func editRegistry(_ registry: CreditCardRegistry, completion: @escaping (Bool) -> Void) {
        guard let id = registry.id else {
            completion(false)
            return
        }
        do {
            try collectionRef.document(id).setData(from: registry, merge: true) { e in
                completion(e == nil)
            }
        } catch {
            Crashlytics.crashlytics().record(error: error)
            completion(false)
        }
    }
}
