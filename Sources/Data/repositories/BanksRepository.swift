import Foundation
import FirebaseFirestore
import FirebaseCrashlytics

class BanksRepository {

    static private let lastUpdateKey = "lastBanksUpdate"
    static private let cacheDuration: CGFloat = 2592000000

    private let db: Firestore
    private let collectionRef: CollectionReference
    private let userDefaults = UserDefaults.standard

    init() {
        db = Firestore.firestore()
        collectionRef = db.collection(Collections.Banks)
    }

    private func shouldUseCache() -> Bool {
        if let lastUpdate = userDefaults.value(forKey: BanksRepository.lastUpdateKey) as? CGFloat {
            return (Date().timeIntervalSince1970 - lastUpdate) < BanksRepository.cacheDuration
        }
        return false
    }

    private func setLastUpdate() {
        userDefaults.set(CGFloat(Date().timeIntervalSince1970), forKey: BanksRepository.lastUpdateKey)
    }

    func getAll(forceCache: Bool = false, _ completion: @escaping ([Bank]) -> Void) {
        let source: FirestoreSource = forceCache || shouldUseCache() ? .cache : .default
        if source == .default {
            setLastUpdate()
        }
        collectionRef.getDocuments(source: source) { (snapshot, error) in
            if let error = error {
                Crashlytics.crashlytics().record(error: error)
                completion([])
            } else {
                var banks: [Bank] = []
                for document in snapshot!.documents {
                    if let bank = try? document.data(as: Bank.self) {
                        banks.append(bank)
                    }
                }
                banks.sort { $0.name < $1.name }
                completion(banks)
            }
        }
    }

    func getFiltered(search: String, completion: @escaping ([Bank]) -> Void) {
        let normalizedSearch = search.prepareCompare()
        getAll(forceCache: true) { (banks) in
            if(search.isEmpty) {
                completion(banks)
                return
            }
            let filteredBanks = banks.filter { (bank) in
                return bank.name.prepareCompare().contains(normalizedSearch) ||
                bank.fullName.prepareCompare().contains(normalizedSearch)
            }
            completion(filteredBanks)
        }
    }
}

