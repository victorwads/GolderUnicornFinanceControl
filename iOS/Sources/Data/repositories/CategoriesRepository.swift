import Firebase
import FirebaseAuth
import FirebaseFirestore
import FirebaseCrashlytics

class RootCategory {
    var category: Category
    var children: [Category] = []

    init(category: Category) {
        self.category = category
    }
}

class CategoriesRepository: RepositoryBase<Category> {

    init(userId: String? = nil) {
        guard let userId = userId ?? Auth.auth().currentUser?.uid else {
            let error = NSError(domain: "Auth", code: 401, userInfo: [NSLocalizedDescriptionKey: "Invalid userId"])
            Crashlytics.crashlytics().record(error: error)
            fatalError(error.localizedDescription)
        }
        super.init(collectionPath: "\(Collections.Users)/\(userId)/\(Collections.Categories)")
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

    func getAllRootCategories(neededSource: FirestoreSource? = nil, completion: @escaping ([RootCategory]?, Error?) -> Void) {
        super.getAll(source: neededSource) { categories in
            var roots: [RootCategory] = []
            var map: [String: Category] = [:]
            for category in categories {
                if let id = category.id { map[id] = category }
                if category.parentId == nil {
                    roots.append(RootCategory(category: category))
                }
            }
            for root in roots {
                for (_, var category) in map {
                    if category.parentId == root.category.id {
                        category.color = root.category.color
                        category.icon = root.category.icon
                        root.children.append(category)
                    }
                }
            }
            completion(roots, nil)
        }
    }

    func getById(id: String) -> Category? {
        super.getById(id)
    }
}

