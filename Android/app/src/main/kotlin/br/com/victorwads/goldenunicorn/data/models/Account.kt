package br.com.victorwads.goldenunicorn.data.models

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.PropertyName

data class Account(
    @DocumentId val id: String,
    @PropertyName("name") val name: String,
    @PropertyName("type") val type: Type = Type.CURRENT,
    @PropertyName("color") val color: String?,
    @PropertyName("bankId") val bankId: String?,

    @PropertyName("initialBalance") val initialBalance: Double = 0.0,
    @PropertyName("includeInDash") val includeInTotal: Boolean = false,

    @PropertyName("createdAt")
    val createdAt: FieldValue? = FieldValue.serverTimestamp(),
) {
    @PropertyName("updatedAt")
    val updatedAt: FieldValue = FieldValue.serverTimestamp()

    enum class Type {
        CURRENT, SAVINGS, INVESTMENT
    }
}