package br.com.victorwads.goldenunicorn.data.models

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.PropertyName

data class Bank(
    @DocumentId val id: String? = null,
    @PropertyName("name") val name: String = "",
    @PropertyName("fullName") val fullName: String = "",
    @PropertyName("logoUrl") val logoUrl: String = ""
)
