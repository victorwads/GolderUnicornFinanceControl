package br.com.victorwads.goldenunicorn.data.repositories

import br.com.victorwads.goldenunicorn.data.firebase.Collections
import br.com.victorwads.goldenunicorn.data.models.Category
import br.com.victorwads.goldenunicorn.data.models.RootCategory
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.CollectionReference

class CategoriesRepository(
    userId: String? = FirebaseAuth.getInstance().currentUser?.uid
) : BaseRepository<Category>(Category::class.java) {

    override val cacheDuration: Long = 0
    override val ref: CollectionReference

    init {
        val finalUserId = userId ?: throw Error("Invalid userId")
        ref = bd
            .collection(Collections.Users)
            .document(finalUserId)
            .collection(Collections.Categories)
    }

    suspend fun getAll(forceCache: Boolean = false): List<Category> =
        getAllItems(forceCache)

    fun getAllRoots(): List<RootCategory> {
        val categories = cache.values
        val roots = mutableMapOf<String, RootCategory>()

        categories.filter { it.parentId == null }.forEach { cat ->
            roots[cat.id] = RootCategory(
                id = cat.id,
                name = cat.name,
                icon = cat.icon,
                color = cat.color,
            )
        }

        categories.filter { it.parentId != null }.forEach { cat ->
            val parent = cat.parentId?.let { roots[it] } ?: return@forEach
            parent.children.add(cat.copy(color = parent.color, icon = parent.icon))
        }
        return roots.values.toList()
    }
}
