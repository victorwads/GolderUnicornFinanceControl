import Firebase
import FirebaseFirestore

class RootCategory {
    var category: Category
    var children: [Category] = []
    
    init(category: Category) {
        self.category = category
    }
}

class CategoriesRepository {
    private let db: Firestore
    private var collectionRef: CollectionReference
    
    private static var rootCategoriesCache: [RootCategory] = []
    private static var categoriesCache: [String: Category] = [:]
    
    init(userId: String? = nil) {
        guard let userId = userId ?? Auth.auth().currentUser?.uid else {
            let error = NSError(domain: "Auth", code: 401, userInfo: [ NSLocalizedDescriptionKey: "Invalid userId"])
            Crashlytics.crashlytics().record(error: error)
            fatalError(error.localizedDescription)
        }
        db = Firestore.firestore()
        collectionRef = db.collection("\(Collections.Users)/\(userId)/\(Collections.Categories)")
    }
    
    func addCategory(category: Category, completion: @escaping (Bool) -> Void) {
        do {
            try collectionRef.addDocument(from: category) { error in
                completion(error == nil)
            }
        } catch {
            Crashlytics.crashlytics().record(error: error)
            completion(false)
        }
    }
    
    func getAll(neededSource: FirestoreSource? = nil, completion: @escaping ([RootCategory]?, Error?) -> Void) {
        let source: FirestoreSource = neededSource ?? .default
        collectionRef.getDocuments(source: source) { querySnapshot, error in
            guard let querySnapshot = querySnapshot else {
                completion(nil, error)
                return
            }
            var rootCategories: [RootCategory] = []
            var categories: [String: Category] = [:]
            for document in querySnapshot.documents {
                if let category = try? document.data(as: Category.self) {
                    categories[category.id!] = category
                    if category.parentId == nil {
                        rootCategories.append(RootCategory(category: category))
                    }
                }
            }
            for root in rootCategories {
                for (id, var category) in categories {
                    if category.parentId == root.category.id {
                        category.color = root.category.color
                        category.icon = root.category.icon
                        root.children.append(category)
                    }
                }
            }
            CategoriesRepository.categoriesCache = categories
            CategoriesRepository.rootCategoriesCache = rootCategories
            completion(rootCategories, nil)
        }
    }
    
    func getById(id: String) -> Category? {
        return CategoriesRepository.categoriesCache[id]
    }
}
