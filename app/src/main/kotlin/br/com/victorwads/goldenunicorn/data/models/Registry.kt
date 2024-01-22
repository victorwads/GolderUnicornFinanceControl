package br.com.victorwads.goldenunicorn.data.models

import com.google.firebase.firestore.DocumentId

data class Registry(
    @DocumentId val id: String? = null,
)
