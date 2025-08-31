package br.com.victorwads.goldenunicorn.crypt

import com.google.firebase.auth.FirebaseAuth
import java.math.BigInteger
import java.security.MessageDigest

object NumericDecryptor {
    private const val FLOAT_PRECISION = 1000
    private const val MASK_SIZE = 2 // 2 bits
    private val MASK = BigInteger.valueOf(0b11L)
    private val BOOLEAN_MASK = BigInteger.ONE
    private const val BOOLEAN_INDEXER_SHIFT = 32
    private val BOOLEAN_INDEXER_SIZE = BigInteger.valueOf(0b11111L) // 5 bits, 0-31
    private const val MAX_MULTIPLIER = 1 shl 4 // 16
    private const val MAX_OFFSET = 1 shl 16 // 65536

    private data class Params(val offset: BigInteger, val multiplier: BigInteger)
    private var cached: Params? = null

    private fun params(): Params {
        cached?.let { return it }
        val uid = FirebaseAuth.getInstance().currentUser?.uid
            ?: throw IllegalStateException("User not authenticated")
        val hash = sha256Hex(uid)
        val offHex = hash.substring(0, 16)
        val mulHex = hash.substring(16, 32)
        val offset = (offHex.toBigInteger(16).mod(BigInteger.valueOf(MAX_OFFSET.toLong())))
        val multiplier = (mulHex.toBigInteger(16).mod(BigInteger.valueOf(MAX_MULTIPLIER.toLong())) + BigInteger.ONE)
        val p = Params(offset, multiplier)
        cached = p
        return p
    }

    fun decryptToPrimitive(encrypted: Number): Any {
        val (offset, multiplier) = params()
        val enc = BigInteger.valueOf(encrypted.toLong())
        val encodedValue = enc.subtract(offset).divide(multiplier)
        val flag = encodedValue.and(MASK)
        val number = encodedValue.shiftRight(MASK_SIZE)

        return when (flag.toInt()) {
            0 -> number.toLong().toDouble() // INTEGER
            1 -> number.toDouble() / FLOAT_PRECISION // FLOAT
            2 -> decodeRandomBoolean(number) // BOOLEAN
            3 -> java.util.Date(number.toLong()) // DATE
            else -> number.toLong()
        }
    }

    fun decryptBoolean(encrypted: Any?): Boolean? = when (encrypted) {
        is Boolean -> encrypted
        is Number -> decryptToPrimitive(encrypted).let { it as? Boolean }
        is String -> encrypted.toBooleanStrictOrNull()
        else -> null
    }

    private fun decodeRandomBoolean(number: BigInteger): Boolean {
        val booleanIndex = number.shiftRight(BOOLEAN_INDEXER_SHIFT)
        val booleanValue = number.shiftRight(booleanIndex.toInt()).and(BOOLEAN_MASK)
        return booleanValue == BigInteger.ONE
    }

    private fun sha256Hex(input: String): String {
        val md = MessageDigest.getInstance("SHA-256")
        val hash = md.digest(input.toByteArray(Charsets.UTF_8))
        return hash.joinToString(separator = "") { b -> "%02x".format(b) }
    }
}

