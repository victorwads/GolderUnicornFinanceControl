package br.com.victorwads.goldenunicorn

import java.text.Normalizer
import java.util.regex.Pattern

fun String.prepareCompare() = Normalizer
    .normalize(this, Normalizer.Form.NFD)
    .let {
        Pattern.compile("\\p{InCombiningDiacriticalMarks}+")
            .matcher(this).replaceAll("")
    }.lowercase()
