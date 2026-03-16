import Foundation
import FirebaseAuth

final class RepositoriesProvider: ObservableObject {
    private let uid: String
    private let encryptor: Encryptor

    // Internal repos (module-internal), not exposed to Views
    private let banksRepo: BanksRepository
    private let categoriesRepo: CategoriesRepository
    private let accountsRepo: AccountsRepository
    private let accountsRegsRepo: AccountsRegistryRepository
    private let creditCardsRepo: CreditCardsRepository

    init?(uid: String?) {
        guard let uid = uid, !uid.isEmpty else { return nil }
        self.uid = uid
        self.encryptor = Encryptor(secret: uid)
        self.banksRepo = BanksRepository()
        self.categoriesRepo = CategoriesRepository()
        self.accountsRepo = AccountsRepository(userId: uid, encryptor: encryptor)
        self.accountsRegsRepo = AccountsRegistryRepository(userId: uid, encryptor: encryptor)
        self.creditCardsRepo = CreditCardsRepository(userId: uid, encryptor: encryptor)
    }

    // Facade methods used by Views/ViewModels
    func loadBanks(forceCache: Bool = false, completion: @escaping ([Bank]) -> Void) {
        banksRepo.getAll(forceCache: forceCache, completion)
    }
    func filterBanks(search: String, completion: @escaping ([Bank]) -> Void) {
        banksRepo.getFiltered(search: search, completion: completion)
    }
    func bankById(_ id: String?) -> Bank? { banksRepo.getById(bankId: id) }

    func loadAccounts(completion: @escaping ([Account]) -> Void) {
        accountsRepo.getAll(completion)
    }
    func loadCategories(completion: @escaping ([Category]) -> Void) {
        categoriesRepo.getAll(completion: completion)
    }
    func addAccount(_ account: Account, completion: @escaping (Bool) -> Void) {
        accountsRepo.add(account: account, completion: completion)
    }

    func loadAccountsRegistries(completion: @escaping ([AccountsRegistry]) -> Void) {
        accountsRegsRepo.getAll(completion: completion)
    }

    func loadCreditCards(completion: @escaping ([CreditCard]) -> Void) {
        creditCardsRepo.getAll(completion)
    }
}
