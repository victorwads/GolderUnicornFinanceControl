import Foundation
import FirebaseFirestore
import FirebaseCrashlytics

class BanksRepository: RepositoryBase<Bank> {

    init() {
        super.init(collectionPath: Collections.Banks)
    }

    func getAll(forceCache: Bool = false, _ completion: @escaping ([Bank]) -> Void) {
        super.getAll(forceCache: forceCache) { banks in
            completion(banks.sorted { $0.name < $1.name })
        }
    }

    func getById(bankId: String?) -> Bank? {
        super.getById(bankId)
    }

    func getFiltered(search: String, completion: @escaping ([Bank]) -> Void) {
        let normalizedSearch = search.prepareCompare()
        getAll(forceCache: true) { banks in
            if search.isEmpty {
                completion(banks)
                return
            }
            let filteredBanks = banks.filter { bank in
                bank.name.prepareCompare().contains(normalizedSearch) ||
                bank.fullName.prepareCompare().contains(normalizedSearch)
            }
            completion(filteredBanks)
        }
    }
}

