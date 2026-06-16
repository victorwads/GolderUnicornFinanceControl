package br.com.victorwads.goldenunicorn.data.repositories

import br.com.victorwads.goldenunicorn.data.crypt.Encryptor
import com.google.firebase.auth.FirebaseAuth

/**
 * Centralizes repository instances and dependency injection, mirroring Web getRepositories/resetRepositories.
 */
class RepositoriesProvider private constructor(
    val uid: String,
    private val banks: BanksRepository,
    private val accounts: AccountsRepository,
    private val categories: CategoriesRepository,
    private val creditCards: CreditCardsRepository,
    private val accountRegistries: DebitRegistryRepository,
) {
    // Expose high-level operations instead of raw repositories
    suspend fun getAllBanks(forceCache: Boolean = false) = banks.getAll(forceCache)
    suspend fun getFilteredBanks(search: String) = banks.getFiltered(search)

    suspend fun getAllAccounts(forceCache: Boolean = false) = accounts.getAll(forceCache)
    fun getAccountsCache(showArchived: Boolean = false) = accounts.getCache(showArchived)

    suspend fun getAllCategories(forceCache: Boolean = false) = categories.getAll(forceCache)
    fun getCategoriesRoots() = categories.getAllRoots()

    suspend fun getAllCreditCards(forceCache: Boolean = false) = creditCards.getAll(forceCache)
    fun getCreditCardsCacheWithBank() = creditCards.getCacheWithBank()

    suspend fun getAllDebitRegistries(forceCache: Boolean = false) = accountRegistries.getAll(forceCache)
    companion object {
        @Volatile private var instance: RepositoriesProvider? = null

        fun reset(userId: String): RepositoriesProvider {
            val encryptor = Encryptor(userId)
            val banks = BanksRepository()
            val accounts = AccountsRepository(userId, encryptor)
            val categories = CategoriesRepository(userId, encryptor)
            val creditCards = CreditCardsRepository(userId, encryptor)
            val accountRegs = DebitRegistryRepository(userId, encryptor)
            val created = RepositoriesProvider(userId, banks, accounts, categories, creditCards, accountRegs)
            instance = created
            return created
        }

        fun get(): RepositoriesProvider {
            return instance ?: throw IllegalStateException("Repositories not initialized. Call RepositoriesProvider.reset(uid) first.")
        }

        fun ensureFromCurrentUser(): RepositoriesProvider {
            val current = instance
            if (current != null) return current
            val uid = FirebaseAuth.getInstance().currentUser?.uid
                ?: throw IllegalStateException("User not logged")
            return reset(uid)
        }
    }
}
