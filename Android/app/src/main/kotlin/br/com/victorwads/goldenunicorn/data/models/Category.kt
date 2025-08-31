package br.com.victorwads.goldenunicorn.data.models

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.PropertyName

/**
 * Simple representation of a category. When [parentId] is null the category is
 * considered a root category and can contain child categories that inherit
 * its [icon] and [color].
 */
data class Category(
    @DocumentId val id: String = "",
    @PropertyName("name") val name: String = "",
    @PropertyName("icon") val icon: String? = null,
    @PropertyName("color") val color: String? = null,
    @PropertyName("parentId") val parentId: String? = null,
)

data class RootCategory(
    val id: String,
    val name: String,
    val icon: String? = null,
    val color: String? = null,
    val children: MutableList<Category> = mutableListOf(),
)
