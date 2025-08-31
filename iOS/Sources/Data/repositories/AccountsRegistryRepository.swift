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
        let chosen = source ?? (forceCache ? .cache : .default)
        collectionRef.getDocuments(source: chosen) { snapshot, error in
            if let error = error {
                Crashlytics.crashlytics().record(error: error)
                completion([])
                return
            }
            var items: [AccountsRegistry] = []
            snapshot?.documents.forEach { doc in
                let raw = doc.data()

                // Decrypt strings
                let accountId = CryptoService.shared.decryptStringIfNeeded(raw["accountId"] as? String ?? "")
                let description = CryptoService.shared.decryptStringIfNeeded(raw["description"] as? String ?? "")
                let categoryId = CryptoService.shared.decryptStringIfNeeded(raw["categoryId"] as? String ?? "")

                // Decrypt numbers/bools/dates
                let valueAny = NumericDecryptorHelper.shared.decryptNumber(raw["value"] as? NSNumber ?? 0) ?? 0
                let value = (valueAny as? NSNumber)?.doubleValue ?? (valueAny as? Double) ?? 0

                let paid = NumericDecryptorHelper.shared.decryptBool(raw["paid"]) ?? (raw["paid"] as? Bool ?? false)

                // Date: Timestamp or encrypted number
                var date: Date = Date()
                if let ts = raw["date"] as? Timestamp {
                    date = ts.dateValue()
                } else if let dn = raw["date"] as? NSNumber {
                    if let d = NumericDecryptorHelper.shared.decryptNumber(dn) as? Date {
                        date = d
                    }
                }

                let tags = raw["tags"] as? [String] ?? []

                let reg = AccountsRegistry(
                    id: doc.documentID,
                    type: .account,
                    accountId: accountId,
                    value: value,
                    description: description,
                    date: date,
                    paid: paid,
                    tags: tags,
                    categoryId: categoryId.isEmpty ? nil : categoryId,
                    observation: nil,
                    relatedInfo: nil
                )
                items.append(reg)
            }
            if let minDate = items.min(by: { $0.date < $1.date })?.date {
                self.firstRegistryDate = minDate
            }
            completion(items)
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
