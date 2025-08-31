import Foundation

class BalanceService {
    private let accountsRepo = AccountsRepository()
    private let creditCardsRepo = CreditCardsRepository()

    func loadBalances(completion: @escaping ([Account]) -> Void) {
        accountsRepo.getAll { accounts in
            completion(accounts)
        }
    }
}
