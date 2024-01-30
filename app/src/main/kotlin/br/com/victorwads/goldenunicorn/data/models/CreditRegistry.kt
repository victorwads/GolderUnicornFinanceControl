package br.com.victorwads.goldenunicorn.data.models

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.PropertyName
import java.util.Date

data class CreditRegistry(
    @DocumentId val id: String? = null,
    @PropertyName("cardId") val bankId: String,
    @PropertyName("invoice") val invoice: String,

    @PropertyName("name") val name: String,
    @PropertyName("type") val type: Type = Type.DEFAULT,
    @PropertyName("date") val date: Date,
    @PropertyName("metadata") val metadata: Metadata? = null,

    @PropertyName("createdAt")
    val createdAt: FieldValue? = FieldValue.serverTimestamp(),
) {
    @PropertyName("updatedAt")
    val updatedAt: FieldValue = FieldValue.serverTimestamp()

    enum class Type {
        DEFAULT, FIXED
    }

    data class Metadata(
        @PropertyName("installmentBillId") val installmentBillId: String? = null,
    )
}
