package br.com.victorwads.goldenunicorn.data.crypt

import android.util.Base64
import java.security.MessageDigest
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

/** Mirrors Web/src/data/crypt/Encryptor.ts behavior needed by repositories. */
class Encryptor(secret: String) {
    companion object { private const val PREFIX = "\$O" }

    private val key: SecretKey
    val numberHandler: NumericEncryptor

    init {
        val digest = MessageDigest.getInstance("SHA-256").digest(secret.toByteArray(Charsets.UTF_8))
        key = SecretKeySpec(digest, "AES")
        numberHandler = NumericEncryptor.fromSecret(secret)
    }

    fun encryptString(value: String): String {
        val iv = java.security.SecureRandom().generateSeed(12)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(128, iv))
        val cipherBytes = cipher.doFinal(value.toByteArray(Charsets.UTF_8))
        val ivB64 = Base64.encodeToString(iv, Base64.NO_WRAP)
        val encB64 = Base64.encodeToString(cipherBytes, Base64.NO_WRAP)
        return "$PREFIX$ivB64:$encB64"
    }

    fun decryptIfNeeded(value: String?): String? {
        if (value.isNullOrEmpty()) return value
        if (!value.startsWith(PREFIX)) return value
        val payload = value.removePrefix(PREFIX)
        val parts = payload.split(":")
        if (parts.size != 2) return value
        val iv = Base64.decode(parts[0], Base64.NO_WRAP)
        val cipherBytes = Base64.decode(parts[1], Base64.NO_WRAP)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(128, iv))
        val plain = cipher.doFinal(cipherBytes)
        return String(plain, Charsets.UTF_8)
    }

    fun decryptBoolean(value: Any?): Boolean? = numberHandler.decryptBoolean(value)
    fun decryptNumeric(value: Number): Any = numberHandler.decrypt(value)
}
