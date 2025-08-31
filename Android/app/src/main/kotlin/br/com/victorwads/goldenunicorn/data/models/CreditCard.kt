package br.com.victorwads.goldenunicorn.data.models

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.PropertyName

data class CreditCard(
    @DocumentId val id: String = "",
    @PropertyName("name") val name: String = "",
    @PropertyName("limit") val limit: Double = 0.0,
    @PropertyName("brand") val brand: String = "",
    @PropertyName("accountId") val accountId: String = "",
    @PropertyName("closingDay") val closingDay: Int = 1,
    @PropertyName("dueDay") val dueDay: Int = 1,
    @PropertyName("archived") val archived: Any? = null,
)
