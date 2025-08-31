import Foundation
import FirebaseAuth
import FirebaseFirestore
import FirebaseCrashlytics

class AccountsRegistryRepository: RepositoryBase<AccountsRegistry> {
    private var firstRegistryDate: Date = Date()

    init(userId: String? = nil) {
        guard let userId = userId ?? Auth.auth().currentUser?.uid else {
            let error = NSError(domain: "Auth", code: 401, userInfo: [NSLocalizedDescriptionKey: "Invalid userId"])
            Crashlytics.crashlytics().record(error: error)
            fatalError(error.localizedDescription)
        }
        super.init(collectionPath: "\(Collections.Users)/\(userId)/\(Collections.AccountsRegistries)")
    }

    override func getAll(source: FirestoreSource? = nil, forceCache: Bool = false, completion: @escaping ([AccountsRegistry]) -> Void) {
        super.getAll(source: source, forceCache: forceCache) { regs in
            if let minDate = regs.min(by: { $0.date < $1.date })?.date {
                self.firstRegistryDate = minDate
            }
            completion(regs)
        }
    }

    func addRegistry(_ registry: AccountsRegistry, completion: @escaping (Bool) -> Void) {
        do {
            try collectionRef.addDocument(from: registry) { e in
                completion(e == nil)
            }
        } catch {
            Crashlytics.crashlytics().record(error: error)
            completion(false)
        }
    }

    func editRegistry(_ registry: AccountsRegistry, completion: @escaping (Bool) -> Void) {
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
