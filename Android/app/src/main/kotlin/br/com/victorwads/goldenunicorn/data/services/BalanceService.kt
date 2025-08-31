package br.com.victorwads.goldenunicorn.data.services

import java.util.Date

class BalanceService(
    private val timeline: TimelineService,
    val period: FinancialMonthPeriod = FinancialMonthPeriod(1)
) {
    data class Snapshot(
        val closingBalance: Double,
        val schema: String = SCHEMA,
    )

    companion object { private const val SCHEMA = "v1" }

    private val cache = mutableMapOf<String, MutableMap<String, Snapshot>>()

    suspend fun getBalance(accountIds: List<String> = emptyList(), date: Date = Date()): Double {
        val month = period.getMonthForDate(date)
        if (accountIds.isEmpty()) return ensureMonth(month).closingBalance
        return accountIds.sumOf { id -> ensureMonth(month, id).closingBalance }
    }

    fun reset() { cache.clear() }

    fun invalidateFrom(date: Date) {
        val ym = period.getMonthForDate(date).key
        val keys = cache.keys.toList().sorted()
        keys.filter { it >= ym }.forEach { cache.remove(it) }
    }

    private suspend fun ensureMonth(month: FinancialMonthPeriod.Month, accountId: String? = null): Snapshot {
        val key = month.key
        val accKey = accountId ?: "all"
        val existing = cache[key]?.get(accKey)
        if (existing?.schema == SCHEMA) return existing

        val p = period.getMonthPeriod(month)
        val regs = timeline.getAccountItems(
            TimelineFilterParams(
                period = TimelineFilterPeriod(p.start, p.end),
                accountIds = accountId?.let { listOf(it) } ?: emptyList(),
                paid = true,
                light = true,
            )
        ).map { it.registry }

        // If first month (no previous data), opening = 0
        val first = timeline.getFirstRegistryDate()
        val opening = if (p.start <= first) 0.0 else {
            val prev = period.prevMonth(month)
            cache[prev.key]?.get(accKey)?.closingBalance ?: 0.0
        }
        val monthSum = regs.sumOf { (it.value as? Number)?.toDouble() ?: 0.0 }
        val snap = Snapshot(closingBalance = opening + monthSum)
        cache.getOrPut(key) { mutableMapOf() }[accKey] = snap
        return snap
    }
}
