import Foundation

struct TimelineFilterPeriod { let start: Date; let end: Date }

struct TimelineFilterParams {
    var period: TimelineFilterPeriod? = nil
    var categoryIds: [String] = []
    var showArchived: Bool = false
    var accountIds: [String] = []
    var paid: Bool? = nil
    var light: Bool = false
    var search: String? = nil
}

struct TimelineDetailsItem {
    let sourceName: String
    let registry: AccountsRegistry
    let category: Category?
}

class TimelineService {
    private let accounts = AccountsRepository()
    private let categories = CategoriesRepository()
    private let accountRegistries = AccountsRegistryRepository()

    func getFirstRegistryDate(completion: @escaping (Date) -> Void) {
        accountRegistries.getAll { regs in
            let first = regs.min(by: { $0.date < $1.date })?.date ?? Date()
            completion(first)
        }
    }

    func getAccountItems(params: TimelineFilterParams = TimelineFilterParams(), completion: @escaping ([TimelineDetailsItem]) -> Void) {
        // Load accounts and categories to allow local lookups
        accounts.getAll { accs in
            self.categories.getAll { _ in
                self.accountRegistries.getAll { regs in
                    let result = self.filterAndMap(regs: regs, accounts: accs, params: params)
                    completion(result)
                }
            }
        }
    }

    private func filterAndMap(regs: [AccountsRegistry], accounts: [Account], params: TimelineFilterParams) -> [TimelineDetailsItem] {
        let period = params.period
        let filtered = regs.filter { r in
            let paidOk = (params.paid == nil) || (params.paid == true && r.paid) || (params.paid == false && !r.paid)
            let periodOk = (period == nil) || (r.date >= period!.start && r.date <= period!.end)
            let categoryOk = params.categoryIds.isEmpty || (r.categoryId != nil && params.categoryIds.contains(r.categoryId!))
            let accountOk: Bool = {
                if params.accountIds.isEmpty {
                    // Without account filter, exclude archived accounts unless showArchived
                    let acc = accounts.first(where: { $0.id == r.accountId })
                    return params.showArchived || (acc?.includeInDash ?? true)
                } else {
                    return params.accountIds.contains(r.accountId)
                }
            }()
            return paidOk && periodOk && categoryOk && accountOk
        }

        let mapped: [TimelineDetailsItem] = filtered.map { reg in
            let accName = accounts.first(where: { $0.id == reg.accountId })?.name ?? "Unknown Source"
            return TimelineDetailsItem(
                sourceName: accName,
                registry: reg,
                category: categories.getById(reg.categoryId)
            )
        }

        let searched: [TimelineDetailsItem]
        if let q = params.search?.trimmingCharacters(in: .whitespacesAndNewlines), !q.isEmpty {
            searched = mapped.filter { d in
                (d.registry.description.lowercased().contains(q.lowercased()) || d.sourceName.lowercased().contains(q.lowercased()) || (d.category?.name.lowercased().contains(q.lowercased()) ?? false))
            }
        } else {
            searched = mapped
        }
        return searched.sorted { $0.registry.date > $1.registry.date }
    }
}
