package br.com.victorwads.goldenunicorn.data.repositories

import android.content.Context
import br.com.victorwads.goldenunicorn.GoldenApplication
import br.com.victorwads.goldenunicorn.data.firebase.Collections
import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.firestore.CollectionReference
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Source
import kotlinx.coroutines.tasks.await
import java.util.Date

abstract class BaseRepository<Model : Any>(
    private val modelClass: Class<Model>,
    private val context: Context = GoldenApplication.publicApplication,
) {
    init {
        if (FirebaseApp.getApps(context).isEmpty()) {
            FirebaseApp.initializeApp(context)
        }
    }

    private val lastUpdateKey: String = modelClass.name
    protected abstract val cacheDuration: Long

    protected val bd = FirebaseFirestore.getInstance()
    protected abstract val ref: CollectionReference

    /**
     * In memory cache for already fetched items keyed by the document id.
     */
    protected val cache = mutableMapOf<String, Model>()

    private val localStorage = context
        .getSharedPreferences(Collections.FirestoreCacheKeys, Context.MODE_PRIVATE)

    private fun shouldUseCache() =
        (cacheDuration > 0) && localStorage.getLong(lastUpdateKey, 0).let {
            (Date().time - it) < cacheDuration
        }

    private fun setLastUpdate() = with(localStorage.edit()) {
        putLong(lastUpdateKey, Date().time)
        apply()
    }

    protected suspend fun getAllItems(
        forceCache: Boolean = false,
        onLoadItem: (model: Model) -> Unit = {},
    ): List<Model> {
        return try {
            val source = if (forceCache || shouldUseCache()) Source.CACHE else Source.DEFAULT
            if (source == Source.DEFAULT) setLastUpdate()
            val snap = ref.get(source).await()
            val items = snap.documents.mapNotNull { snapshot ->
                snapshot.toObject(modelClass)?.also { model ->
                    addToCache(snapshot.id, model)
                    onLoadItem(model)
                }
            }
            Log.d("Repo", "Loaded ${items.size} items from ${ref.path} using ${source}")
            items
        } catch (e: Exception) {
            Log.e("Repo", "Error loading from ${ref.path}: ${e.message}", e)
            emptyList()
        }
    }

    protected open fun addToCache(id: String, model: Model) {
        cache[id] = model
    }

    fun getLocalById(id: String): Model? = cache[id]
}
