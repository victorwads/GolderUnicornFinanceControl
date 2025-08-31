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
        let source = neededSource ?? .default
        if source == .default { /* update cache time is inside base */ }
        collectionRef.getDocuments(source: source) { snapshot, error in
            if let error = error {
                Crashlytics.crashlytics().record(error: error)
                completion([])
                return
            }
            var items: [Account] = []
            snapshot?.documents.forEach { doc in
                let raw = doc.data()
                // Decrypt string fields
                let name = CryptoService.shared.decryptStringIfNeeded(raw["name"] as? String ?? "")
                let bankId = CryptoService.shared.decryptStringIfNeeded(raw["bankId"] as? String ?? "")
                // Numeric/boolean fields may be encrypted
                let initialBalanceAny = NumericDecryptorHelper.shared.decryptNumber(raw["initialBalance"] as? NSNumber ?? 0) ?? 0
                let initialBalance = (initialBalanceAny as? NSNumber)?.doubleValue ?? (initialBalanceAny as? Double) ?? 0
                var account = Account()
                account.id = doc.documentID
                account.name = name
                account.bankId = bankId.isEmpty ? nil : bankId
                account.initialBalance = initialBalance
                items.append(account)
            }
            completion(items)
        }
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
