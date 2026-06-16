import Foundation

// Minimal month helper (mirrors Web FinancialMonthPeriod)
struct FinancialMonthPeriod {
    struct Month { let year: Int; let month: Int; var key: String { String(format: "%04d-%02d", year, month) } }
    struct Period { let start: Date; let end: Date }
    let cutOff: Int
    init(_ cutOff: Int = 1) { self.cutOff = max(1, min(27, cutOff)) }
    func month(for date: Date = Date()) -> Month {
            let cal = Calendar.current
            let d = cal.component(.day, from: date)
            var y = cal.component(.year, from: date)
            var m = cal.component(.month, from: date)
            if d < cutOff { m -= 1; if m == 0 { m = 12; y -= 1 } }
            return Month(year: y, month: m)
        }
        func period(for month: Month) -> Period {
            var comp = DateComponents(); comp.year = month.year; comp.month = month.month; comp.day = cutOff; comp.hour = 0; comp.minute = 0; comp.second = 0
            let cal = Calendar.current
            let start = cal.date(from: comp) ?? Date()
        let end = cal.date(byAdding: .month, value: 1, to: start)?.addingTimeInterval(-0.001) ?? start
        return Period(start: start, end: end)
    }
    func prev(_ m: Month) -> Month { m.month == 1 ? Month(year: m.year - 1, month: 12) : Month(year: m.year, month: m.month - 1) }
}

class BalanceService {
    struct Snapshot { let closingBalance: Double; let schema: String }
    private static let SCHEMA = "v1"

    private let timeline: TimelineService
    private let period: FinancialMonthPeriod

    private var cache: [String: [String: Snapshot]] = [:]

    init(timeline: TimelineService, period: FinancialMonthPeriod = FinancialMonthPeriod(1)) {
        self.timeline = timeline
        self.period = period
    }

    func reset() { cache.removeAll() }

    func getBalance(accountIds: [String] = [], date: Date = Date(), completion: @escaping (Double) -> Void) {
        let m = period.month(for: date)
        if accountIds.isEmpty {
            ensureMonthComputed(month: m, accountId: Optional<String>.none) { snap in completion(snap.closingBalance) }
        } else {
            var pending = accountIds.count
            var total: Double = 0
            for id in accountIds {
                ensureMonthComputed(month: m, accountId: id) { snap in
                    total += snap.closingBalance
                    pending -= 1
                    if pending == 0 { completion(total) }
                }
            }
        }
    }

    private func ensureMonthComputed(month: FinancialMonthPeriod.Month, accountId: String?, completion: @escaping (Snapshot) -> Void) {
        let ym = month.key
        let key = accountId ?? "all"
        if let snap = cache[ym]?[key], snap.schema == Self.SCHEMA {
            completion(snap); return
        }

        let p = period.period(for: month)
        timeline.getAccountItems(params: TimelineFilterParams(period: TimelineFilterPeriod(start: p.start, end: p.end), accountIds: accountId.map { [$0] } ?? [], paid: true, light: true)) { items in
            let monthSum = items.reduce(0.0) { acc, r in acc + r.registry.value }
            // compute opening from prev month recursively
            let prev = self.period.prev(month)
            self.ensureMonthComputedIfNeeded(month: prev, accountId: accountId) { opening in
                let snap = Snapshot(closingBalance: opening + monthSum, schema: Self.SCHEMA)
                var map = self.cache[ym] ?? [:]
                map[key] = snap
                self.cache[ym] = map
                completion(snap)
            }
        }
    }

    private func ensureMonthComputedIfNeeded(month: FinancialMonthPeriod.Month, accountId: String?, completion: @escaping (Double) -> Void) {
        let ym = month.key
        let key = accountId ?? "all"
        if let snap = cache[ym]?[key], snap.schema == Self.SCHEMA { completion(snap.closingBalance); return }
        // base case: no previous snapshot; open = 0
        if month.year < 1971 { completion(0.0); return }
        ensureMonthComputed(month: month, accountId: accountId) { s in completion(s.closingBalance) }
    }
}
