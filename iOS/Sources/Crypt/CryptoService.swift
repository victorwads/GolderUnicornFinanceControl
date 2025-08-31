//
//  CryptoService.swift
//  GoldenUnicorn
//
//  Minimal decrypt compatible with Web Encryptor (AES-GCM + "$O" prefix)
//

import Foundation
import CryptoKit
import FirebaseAuth

enum CryptoError: Error { case notLogged }

class CryptoService {
    static let shared = CryptoService()
    private init() {}

    private var cachedKey: SymmetricKey?

    private func ensureKey() throws -> SymmetricKey {
        if let key = cachedKey { return key }
        guard let uid = Auth.auth().currentUser?.uid else { throw CryptoError.notLogged }
        let digest = SHA256.hash(data: Data(uid.utf8))
        let key = SymmetricKey(data: Data(digest))
        cachedKey = key
        return key
    }

    func decryptIfNeeded(_ value: Any?) -> Any? {
        guard let value = value else { return nil }
        if let s = value as? String {
            return decryptStringIfNeeded(s)
        }
        return value
    }

    func decryptStringIfNeeded(_ value: String) -> String {
        guard value.hasPrefix("$O") else { return value }
        let payload = String(value.dropFirst(2))
        let parts = payload.split(separator: ":", maxSplits: 1).map(String.init)
        guard parts.count == 2,
              let ivData = Data(base64Encoded: parts[0]),
              let cipherCombined = Data(base64Encoded: parts[1]) else {
            return value
        }
        do {
            let key = try ensureKey()
            // Split ciphertext and tag (last 16 bytes)
            guard cipherCombined.count > 16 else { return value }
            let tagRange = cipherCombined.index(cipherCombined.endIndex, offsetBy: -16)..<cipherCombined.endIndex
            let tag = cipherCombined[tagRange]
            let ciphertext = cipherCombined[..<tagRange.lowerBound]
            let nonce = try AES.GCM.Nonce(data: ivData)
            let box = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
            let plain = try AES.GCM.open(box, using: key)
            return String(data: plain, encoding: .utf8) ?? value
        } catch {
            return value
        }
    }
}

