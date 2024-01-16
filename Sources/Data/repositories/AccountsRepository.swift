import Foundation
import FirebaseFirestore
import FirebaseAuth
import FirebaseCrashlytics

class AccountsRepository {
    
    static private let lastUpdateKey = "lastBanksUpdate"
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
    
    func add(account: Account, completion: @escaping (Bool) -> Void) {
        do {
            try collectionRef.addDocument(from: account, completion: { e in
                completion(e == nil)
            })
        } catch {
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
