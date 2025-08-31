package br.com.victorwads.goldenunicorn.data.services

import br.com.victorwads.goldenunicorn.data.models.DebitRegistry
import br.com.victorwads.goldenunicorn.data.models.Category
import br.com.victorwads.goldenunicorn.data.repositories.AccountsRepository
import br.com.victorwads.goldenunicorn.data.repositories.CategoriesRepository
import br.com.victorwads.goldenunicorn.data.repositories.DebitRegistryRepository
import java.util.Date

data class TimelineFilterPeriod(val start: Date, val end: Date)

data class TimelineFilterParams(
    val period: TimelineFilterPeriod? = null,
    val categoryIds: List<String> = emptyList(),
    val showArchived: Boolean = false,
    val accountIds: List<String> = emptyList(),
    val paid: Boolean? = null,
    val light: Boolean = false,
    val search: String? = null,
)

data class RegistryWithDetails(
    val sourceName: String,
    val registry: DebitRegistry,
    val category: Category? = null,
)

class TimelineService(
    private val accounts: AccountsRepository,
    private val categories: CategoriesRepository,
    private val accountRegistries: DebitRegistryRepository,
) {
    suspend fun getAccountItems(params: TimelineFilterParams = TimelineFilterParams()): List<RegistryWithDetails> {
        val period = params.period
        val regs = accountRegistries.getAll(forceCache = false)

        val filtered = regs.filter { r ->
            (params.paid == null || (params.paid == true && (r.paid as? Boolean ?: false)) || (params.paid == false && !(r.paid as? Boolean ?: false))) &&
            (period == null || (r.date >= period.start && r.date <= period.end)) &&
            (params.categoryIds.isEmpty() || (r.categoryId != null && params.categoryIds.contains(r.categoryId))) &&
            (
                if (params.accountIds.isEmpty()) {
                    val acc = accounts.getLocalById(r.bankId)
                    params.showArchived || (acc?.let { a ->
                        val archived = when (val v = a.archived) {
                            is Boolean -> v
                            is Number -> v.toInt() != 0
                            else -> false
                        }
                        !archived
                    } ?: true)
                } else {
                    params.accountIds.contains(r.bankId)
                }
            )
        }

        val detailed = filtered.map { reg ->
            RegistryWithDetails(
                registry = reg,
                category = categories.getLocalById(reg.categoryId ?: ""),
                sourceName = accounts.getLocalById(reg.bankId)?.name ?: "Unknown Source",
            )
        }

        val searched = params.search?.trim()?.takeIf { it.isNotEmpty() }?.let { q ->
            val query = q.lowercase()
            detailed.filter { d ->
                (d.registry.description?.lowercase()?.contains(query) == true
                    || d.sourceName.lowercase().contains(query)
                    || (d.category?.name?.lowercase()?.contains(query) == true))
            }
        } ?: detailed

        return searched.sortedByDescending { it.registry.date }
    }

    suspend fun getFirstRegistryDate(): Date {
        val regs = accountRegistries.getAll(forceCache = false)
        return regs.minByOrNull { it.date }?.date ?: Date(0)
    }
}
