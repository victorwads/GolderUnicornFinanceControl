import Foundation
import FirebaseFirestore
import FirebaseAuth
import FirebaseCrashlytics

class AccountsRepository {
    
    static private let lastUpdateKey = "lastAccountsUpdate"
    static private let cacheDuration: CGFloat = 2592000000
    
    private let db: Firestore
    private let collectionRef: CollectionReference
    private let userDefaults = UserDefaults.standard
    
    init(userId: String? = nil) {
        guard let userId = userId ?? Auth.auth().currentUser?.uid else {
            let error = NSError(domain: "Auth", code: 401, userInfo: [ NSLocalizedDescriptionKey: "Invalid userId"])
            Crashlytics.crashlytics().record(error: error)
            fatalError(error.localizedDescription)
        }
        db = Firestore.firestore()
        collectionRef = db.collection("\(Collections.Users)/\(userId)/\(Collections.Accounts)")
    }
    
    private func shouldUseCache() -> Bool {
        if let lastUpdate = userDefaults.value(forKey: AccountsRepository.lastUpdateKey) as? CGFloat {
            return (Date().timeIntervalSince1970 - lastUpdate) < AccountsRepository.cacheDuration
        }
        return false
    }

    private func setLastUpdate() {
        userDefaults.set(CGFloat(Date().timeIntervalSince1970), forKey: AccountsRepository.lastUpdateKey)
    }
    
    func getAll(neededSource: FirestoreSource? = nil, _ completion: @escaping ([Account]) -> Void) {
        let source: FirestoreSource = neededSource ?? (shouldUseCache() ? .cache : .default)
        if source == .default {
            setLastUpdate()
        }
        collectionRef.getDocuments(source: source) { (snapshot, error) in
            if let error = error {
                Crashlytics.crashlytics().record(error: error)
                completion([])
            } else {
                var accounts: [Account] = []
                for document in snapshot!.documents {
                    if let bank = try? document.data(as: Account.self) {
                        accounts.append(bank)
                    }
                }
                accounts.sort { $0.name < $1.name }
                completion(accounts)
            }
        }
    }
    
    func add(account: Account, completion: @escaping (Bool) -> Void) {
        do {
            try collectionRef.addDocument(from: account, completion: { e in
                completion(e == nil)
            })
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
