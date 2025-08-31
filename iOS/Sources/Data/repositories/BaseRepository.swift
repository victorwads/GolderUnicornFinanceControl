import FirebaseFirestore

class BaseRepository<Model: Codable & Identifiable> {
    private var modelType: Model.Type
    private var collection: CollectionReference
    private var lastUpdateKey: String
    private var cacheDuration: TimeInterval {
        fatalError("cacheDuration has not been implemented")
    }

    init(modelType: Model.Type, collectionPath: String) {
        self.modelType = modelType
        collection = Firestore.firestore().collection(collectionPath)
        lastUpdateKey = "\(modelType)-lastUpdate"
    }

    private func shouldUseCache() -> Bool {
        let lastUpdate = UserDefaults.standard.double(forKey: lastUpdateKey)
        let now = Date().timeIntervalSince1970
        return cacheDuration > 0 && (now - lastUpdate) < cacheDuration
    }

    private func setLastUpdate() {
        let now = Date().timeIntervalSince1970
        UserDefaults.standard.set(now, forKey: lastUpdateKey)
    }

    func getItems(
        forceCache: Bool = false,
        onChangeQuery: @escaping (CollectionReference) -> Query = { $0 },
        onLoadItem: @escaping (Model) -> Void = { _ in },
        completion: @escaping ([Model]?, Error?) -> Void
    ) {
        let source: FirestoreSource = forceCache || shouldUseCache() ? .cache : .default
        if source == .default {
            setLastUpdate()
        }
        let query = onChangeQuery(collection)
        query.getDocuments(source: source) { querySnapshot, error in
            if let error = error {
                completion(nil, error)
            } else {
                let models: [Model] = querySnapshot?.documents.compactMap { document in
                    if let model = try? document.data(as: Model.self) {
                        onLoadItem(model)
                        return model
                    } else {
                        return nil
                    }
                } ?? []
                completion(models, nil)
            }
        }
    }
}
