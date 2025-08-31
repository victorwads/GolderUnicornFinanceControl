package br.com.victorwads.goldenunicorn.data.models

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.PropertyName

data class Account(
    @DocumentId val id: String = "",
    @PropertyName("name") val name: String = "",
    @PropertyName("type") val type: String = "",
    @PropertyName("color") val color: String? = null,
    @PropertyName("bankId") val bankId: String? = null,

    @PropertyName("initialBalance") val initialBalance: Any? = null,
    @PropertyName("includeInTotal") val includeInTotal: Any? = null,
    @PropertyName("archived") val archived: Any? = null,

    @PropertyName("createdAt")
    val createdAt: FieldValue? = null,
) {
    @PropertyName("updatedAt")
    val updatedAt: FieldValue? = null

    enum class Type {
        CURRENT, SAVINGS, INVESTMENT, CASH
    }
}
