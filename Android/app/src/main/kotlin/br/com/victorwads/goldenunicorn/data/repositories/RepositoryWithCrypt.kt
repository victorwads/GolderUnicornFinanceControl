package br.com.victorwads.goldenunicorn.data.repositories

import br.com.victorwads.goldenunicorn.data.crypt.Encryptor
import com.google.firebase.firestore.CollectionReference

/**
 * Mirrors the Web RepositoryWithCrypt concept by carrying an Encryptor dependency.
 * Concrete repositories can use [encryptor] when writing sensitive fields.
 */
internal abstract class RepositoryWithCrypt<Model : Any>(
    modelClass: Class<Model>,
    protected val encryptor: Encryptor,
) : BaseRepository<Model>(modelClass) {
    protected abstract override val ref: CollectionReference
}
