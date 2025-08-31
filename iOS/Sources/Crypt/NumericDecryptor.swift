//
//  NumericDecryptor.swift
//  GoldenUnicorn
//
//  Decrypts numbers/booleans/dates encoded by Web NumericEncryptor
//

import Foundation
import CryptoKit
import FirebaseAuth

class NumericDecryptor {
    static let shared = NumericDecryptor()
    private init() {}

    private var offset: UInt64 = 0
    private var multiplier: UInt64 = 1
    private var ready = false

    private func ensure() throws {
        if ready { return }
        guard let uid = Auth.auth().currentUser?.uid else { throw NSError(domain: "Auth", code: 401) }
        let digest = SHA256.hash(data: Data(uid.utf8))
        let hex = digest.compactMap { String(format: "%02x", $0) }.joined()
        let offHex = String(hex.prefix(16))
        let mulHex = String(hex.dropFirst(16).prefix(16))
        let MAX_MULTIPLIER: UInt64 = 1 << 4
        let MAX_OFFSET: UInt64 = 1 << 16
        offset = (UInt64(offHex, radix: 16) ?? 0) % MAX_OFFSET
        multiplier = ((UInt64(mulHex, radix: 16) ?? 0) % MAX_MULTIPLIER) + 1
        ready = true
    }

    func decryptPrimitive(_ encrypted: Any?) -> Any? {
        guard let encrypted = encrypted else { return nil }
        if let b = encrypted as? Bool { return b }
        if let n = encrypted as? NSNumber { return decryptNumber(n) }
        if let s = encrypted as? String { return Bool(s) ?? s }
        return encrypted
    }

    func decryptBool(_ value: Any?) -> Bool? {
        if let b = value as? Bool { return b }
        if let n = value as? NSNumber { return decryptNumber(n) as? Bool }
        if let s = value as? String { return Bool(s) }
        return nil
    }

    private func decryptNumber(_ n: NSNumber) -> Any? {
        do { try ensure() } catch { return n }
        var enc = n.uint64Value
        // encodedValue = (enc - offset) / multiplier
        if enc < offset { return n }
        enc = (enc - offset) / multiplier
        let flag = enc & 0b11
        let number = enc >> 2
        switch flag {
        case 0: // integer
            return Double(number)
        case 1: // float
            return Double(number) / 1000.0
        case 2: // boolean
            // booleanIndex = number >> 32; booleanValue = (number >> index) & 1
            let booleanIndex = number >> 32
            let booleanValue = (number >> booleanIndex) & 1
            return booleanValue == 1
        case 3: // date
            return Date(timeIntervalSince1970: TimeInterval(number))
        default:
            return n
        }
    }
}

