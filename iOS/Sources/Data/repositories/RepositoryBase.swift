import Foundation
import FirebaseCore
import FirebaseFirestore
import FirebaseCrashlytics

private let REPOSITORY_DEFAULT_CACHE_DURATION: TimeInterval = 2_592_000 // 30 days

class RepositoryBase<Model: Codable & Identifiable> where Model.ID == String? {

    let collectionRef: CollectionReference
    private let userDefaults = UserDefaults.standard
    private let lastUpdateKey: String
    private let cacheDuration: TimeInterval
    private var cache: [String: Model] = [:]

    init(collectionPath: String, cacheDuration: TimeInterval = REPOSITORY_DEFAULT_CACHE_DURATION) {
        if FirebaseApp.app() == nil {
            FirebaseApp.configure()
        }
        let db = Firestore.firestore()
        self.collectionRef = db.collection(collectionPath)
        self.cacheDuration = cacheDuration
        self.lastUpdateKey = "last\(collectionPath.replacingOccurrences(of: "/", with: ""))Update"
    }

    func getAll(source: FirestoreSource? = nil, forceCache: Bool = false, completion: @escaping ([Model]) -> Void) {
        let source = source ?? (forceCache || shouldUseCache() ? .cache : .default)
        if source == .default { setLastUpdate() }
        collectionRef.getDocuments(source: source) { snapshot, error in
            if let error = error {
                Crashlytics.crashlytics().record(error: error)
                completion([])
                return
            }
            var items: [Model] = []
            snapshot?.documents.forEach { doc in
                if let model = try? doc.data(as: Model.self) {
                    items.append(model)
                    if let id = model.id { self.cache[id] = model }
                }
            }
            completion(items)
        }
    }

    func getById(_ id: String?) -> Model? {
        guard let id = id else { return nil }
        return cache[id]
    }

    private func shouldUseCache() -> Bool {
        if let lastUpdate = userDefaults.value(forKey: lastUpdateKey) as? TimeInterval {
            return Date().timeIntervalSince1970 - lastUpdate < cacheDuration
        }
        return false
    }

    private func setLastUpdate() {
        userDefaults.set(Date().timeIntervalSince1970, forKey: lastUpdateKey)
    }
}
