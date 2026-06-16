import Foundation
import CryptoKit

final class Encryptor {
    private let key: SymmetricKey
    private let numeric: NumericEncryptor

    init(secret: String) {
        let digest = SHA256.hash(data: Data(secret.utf8))
        self.key = SymmetricKey(data: Data(digest))
        let hex = digest.map { String(format: "%02x", $0) }.joined()
        self.numeric = NumericEncryptor(hashHex: hex)
    }

    func decryptStringIfNeeded(_ value: String) -> String {
        guard value.hasPrefix("$O") else { return value }
        let payload = String(value.dropFirst(2))
        let parts = payload.split(separator: ":", maxSplits: 1).map(String.init)
        guard parts.count == 2,
              let ivData = Data(base64Encoded: parts[0]),
              let cipherCombined = Data(base64Encoded: parts[1]) else { return value }
        do {
            guard cipherCombined.count > 16 else { return value }
            let tagRange = cipherCombined.index(cipherCombined.endIndex, offsetBy: -16)..<cipherCombined.endIndex
            let tag = cipherCombined[tagRange]
            let ciphertext = cipherCombined[..<tagRange.lowerBound]
            let nonce = try AES.GCM.Nonce(data: ivData)
            let box = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
            let plain = try AES.GCM.open(box, using: key)
            return String(data: plain, encoding: .utf8) ?? value
        } catch { return value }
    }

    func decryptNumber(_ n: NSNumber) -> Any? { numeric.decrypt(n) }

    func decryptBool(_ value: Any?) -> Bool? {
        if let b = value as? Bool { return b }
        if let n = value as? NSNumber { return decryptNumber(n) as? Bool }
        if let s = value as? String { return Bool(s) }
        return nil
    }
}

// Mirror Web: NumericEncryptor
final class NumericEncryptor {
    private let MAX_MULTIPLIER: UInt64 = 1 << 4
    private let MAX_OFFSET: UInt64 = 1 << 16
    private let offset: UInt64
    private let multiplier: UInt64

    init(hashHex: String) {
        let offHex = String(hashHex.prefix(16))
        let mulHex = String(hashHex.dropFirst(16).prefix(16))
        self.offset = (UInt64(offHex, radix: 16) ?? 0) % MAX_OFFSET
        self.multiplier = ((UInt64(mulHex, radix: 16) ?? 0) % MAX_MULTIPLIER) + 1
    }

    func decrypt(_ n: NSNumber) -> Any? {
        var enc = n.uint64Value
        if enc < offset { return n }
        enc = (enc - offset) / multiplier
        let flag = enc & 0b11
        let number = enc >> 2
        switch flag {
        case 0: return Double(number)
        case 1: return Double(number) / 1000.0
        case 2:
            let booleanIndex = number >> 32
            let booleanValue = (number >> booleanIndex) & 1
            return booleanValue == 1
        case 3:
            return Date(timeIntervalSince1970: TimeInterval(number) / 1000.0)
        default: return n
        }
    }
}
