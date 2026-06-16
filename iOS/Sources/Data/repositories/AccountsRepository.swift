import Foundation
import FirebaseFirestore
import FirebaseCrashlytics

class AccountsRepository: RepositoryWithCrypt<Account> {

    init(userId: String, encryptor: Encryptor) {
        super.init(collectionPath: "\(Collections.Users)/\(userId)/\(Collections.Accounts)", encryptor: encryptor)
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
                // Decrypt fields using injected encryptor
                let name = self.encryptor.decryptStringIfNeeded(raw["name"] as? String ?? "")
                let bankId = self.encryptor.decryptStringIfNeeded(raw["bankId"] as? String ?? "")
                let initialBalanceAny = self.encryptor.decryptNumber(raw["initialBalance"] as? NSNumber ?? 0) ?? 0
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
