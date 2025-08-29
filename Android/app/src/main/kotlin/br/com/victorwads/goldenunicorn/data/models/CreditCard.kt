package br.com.victorwads.goldenunicorn.data.models

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.PropertyName

data class CreditCard(
    @DocumentId val id: String,
    @PropertyName("name") val name: String,

    @PropertyName("color") val color: String?,
    @PropertyName("bankId") val bankId: String?,

    @PropertyName("createdAt")
    val createdAt: FieldValue? = FieldValue.serverTimestamp(),
) {
    @PropertyName("updatedAt")
    val updatedAt: FieldValue = FieldValue.serverTimestamp()
}