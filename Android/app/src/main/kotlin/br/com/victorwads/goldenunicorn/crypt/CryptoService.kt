package br.com.victorwads.goldenunicorn.crypt

import android.util.Base64
import com.google.firebase.auth.FirebaseAuth
import java.security.MessageDigest
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

object CryptoService {
    private const val PREFIX = "\$O"
    private var secretKey: SecretKey? = null

    private fun ensureInit() {
        if (secretKey != null) return
        val uid = try { FirebaseAuth.getInstance().currentUser?.uid } catch (_: Exception) { null }
        require(!uid.isNullOrBlank()) { "User not authenticated for decryption" }
        val digest = MessageDigest.getInstance("SHA-256").digest(uid.toByteArray(Charsets.UTF_8))
        secretKey = SecretKeySpec(digest, "AES")
    }

    fun decryptIfNeeded(value: String?): String? {
        if (value.isNullOrEmpty()) return value
        return if (value.startsWith(PREFIX)) decryptString(value) else value
    }

    private fun decryptString(prefixed: String): String {
        ensureInit()
        val parts = prefixed.removePrefix(PREFIX).split(":")
        if (parts.size != 2) return prefixed // malformed; return as-is
        val iv = Base64.decode(parts[0], Base64.NO_WRAP)
        val cipherBytes = Base64.decode(parts[1], Base64.NO_WRAP)

        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val spec = GCMParameterSpec(128, iv)
        cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
        val plain = cipher.doFinal(cipherBytes)
        return String(plain, Charsets.UTF_8)
    }
}

