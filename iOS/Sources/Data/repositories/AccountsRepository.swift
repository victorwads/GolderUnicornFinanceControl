import Foundation
import FirebaseFirestore
import FirebaseAuth
import FirebaseCrashlytics

class AccountsRepository: RepositoryBase<Account> {

    init(userId: String? = nil) {
        guard let userId = userId ?? Auth.auth().currentUser?.uid else {
            let error = NSError(domain: "Auth", code: 401, userInfo: [NSLocalizedDescriptionKey: "Invalid userId"])
            Crashlytics.crashlytics().record(error: error)
            fatalError(error.localizedDescription)
        }
        super.init(collectionPath: "\(Collections.Users)/\(userId)/\(Collections.Accounts)")
    }

    func getAll(neededSource: FirestoreSource? = nil, _ completion: @escaping ([Account]) -> Void) {
        super.getAll(source: neededSource, completion: completion)
    }

    func add(account: Account, completion: @escaping (Bool) -> Void) {
        do {
            try collectionRef.addDocument(from: account) { e in
                completion(e == nil)
            }
        } catch {
            Crashlytics.crashlytics().record(error: error)
            completion(false)
        }
    }

    func update(account: Account) {
        var account = account
        account.updatedAt = Date()
        // TODO
    }

    func arquive(account: Account) {
        // TODO
    }
}

