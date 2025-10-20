package br.com.victorwads.goldenunicorn.data.crypt

import java.math.BigInteger
import java.security.MessageDigest

/**
 * Kotlin port mirroring Web/src/data/crypt/NumericEncryptor.ts for decoding legacy numeric payloads.
 * Provides decrypt for integers, floats (3 decimals), booleans and dates.
 */
class NumericEncryptor private constructor(
    private val offset: BigInteger,
    private val multiplier: BigInteger,
) {
    companion object {
        private val MASK = BigInteger.valueOf(0b11)
        private const val MASK_SIZE = 2
        private const val FLOAT_PRECISION = 1000
        private const val MAX_MULTIPLIER = 1 shl 4 // 16
        private const val MAX_OFFSET = 1 shl 16 // 65536

        fun fromSecret(secret: String): NumericEncryptor {
            val digest = MessageDigest.getInstance("SHA-256").digest(secret.toByteArray(Charsets.UTF_8))
            val hex = digest.joinToString("") { b -> "%02x".format(b) }
            val offHex = hex.substring(0, 16)
            val mulHex = hex.substring(16, 32)
            // Follow Web logic (Number precision for multiplier, BigInt for offset remainder)
            val offVal = BigInteger(offHex, 16).mod(BigInteger.valueOf(MAX_OFFSET.toLong()))
            val mulDouble = java.lang.Long.parseUnsignedLong(mulHex, 16).toDouble()
            val mulVal = ((mulDouble % MAX_MULTIPLIER).toLong() + 1L)
            return NumericEncryptor(offVal, BigInteger.valueOf(mulVal))
        }
    }

    fun decrypt(flaggedEncryptedNumber: Number): Any {
        val enc = BigInteger.valueOf(flaggedEncryptedNumber.toLong())
        val encoded = enc.subtract(offset).divide(multiplier)
        val flag = encoded.and(MASK).toInt()
        val number = encoded.shiftRight(MASK_SIZE)
        return when (flag) {
            0 -> number.toLong().toDouble()
            1 -> number.toDouble() / FLOAT_PRECISION
            2 -> decodeRandomBoolean(number)
            3 -> java.util.Date(number.toLong())
            else -> number.toLong()
        }
    }

    fun decryptBoolean(value: Any?): Boolean? = when (value) {
        is Boolean -> value
        is Number -> decrypt(value) as? Boolean
        is String -> value.toBooleanStrictOrNull()
        else -> null
    }

    private fun decodeRandomBoolean(value: BigInteger): Boolean {
        val index = value.shiftRight(32).toInt()
        val booleanValue = value.shiftRight(index).and(BigInteger.ONE)
        return booleanValue == BigInteger.ONE
    }
}

