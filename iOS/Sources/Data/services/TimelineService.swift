import Foundation

class TimelineService {
    private let accountsRepo = AccountsRepository()
    private let categoriesRepo = CategoriesRepository()

    func loadTimeline(completion: @escaping ([RegistryWithDetails]) -> Void) {
        accountsRepo.getAll { _ in
            completion([])
        }
    }
}
