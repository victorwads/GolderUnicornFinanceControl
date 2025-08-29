package br.com.victorwads.goldenunicorn.data.repositories

import android.content.Context
import br.com.victorwads.goldenunicorn.GoldenApplication
import br.com.victorwads.goldenunicorn.data.firebase.Collections
import com.google.firebase.firestore.CollectionReference
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Source
import kotlinx.coroutines.tasks.await
import java.util.Date

abstract class BaseRepository<Model>(
    private val modelClass: Class<Model>,
    context: Context = GoldenApplication.publicApplication
) {

    private val lastUpdateKey: String = modelClass.name
    protected abstract val cacheDuration: Long

    protected val bd = FirebaseFirestore.getInstance()
    protected abstract val ref: CollectionReference

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
        onLoadItem: (model: Model) -> Unit = {}
    ): List<Model> {
        val source = if (forceCache || shouldUseCache()) Source.CACHE
        else Source.DEFAULT
        if (source == Source.DEFAULT) setLastUpdate()
        return ref.get(source).await().documents.mapNotNull { snapshot ->
            snapshot.toObject(modelClass).also { model ->
                model?.let { onLoadItem(it) }
            }
        }
    }

}