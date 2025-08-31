package br.com.victorwads.goldenunicorn.data.models

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.PropertyName
import java.util.Date

data class DebitRegistry(
    @DocumentId val id: String? = null,
    @PropertyName("bankId") val bankId: String = "",

    @PropertyName("name") val name: String = "",
    @PropertyName("description") val description: String? = null,
    @PropertyName("type") val type: Type = Type.DEFAULT,
    @PropertyName("date") val date: Date = Date(),
    @PropertyName("paid") val paid: Any? = null,
    @PropertyName("value") val value: Any? = null,
    @PropertyName("metadata") val metadata: Metadata? = null,
) {
    enum class Type {
        DEFAULT, FIXED
    }

    data class Metadata(
        @PropertyName("fixedBillId")
        val installmentBillId: String? = null,
        @PropertyName("recurrentBillId")
        val recurrentBillId: String? = null,
    )
}
