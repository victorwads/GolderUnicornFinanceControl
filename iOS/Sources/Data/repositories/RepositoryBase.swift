import Foundation
import FirebaseCore
import FirebaseFirestore
import FirebaseCrashlytics
import FirebaseAuth
import CryptoKit

private let REPOSITORY_DEFAULT_CACHE_DURATION: TimeInterval = 2_592_000 // 30 days

class RepositoryBase<Model: Codable & Identifiable> where Model.ID == String? {

    let collectionRef: CollectionReference
    private let userDefaults = UserDefaults.standard
    private let lastUpdateKey: String
    private let cacheDuration: TimeInterval
    private var cache: [String: Model] = [:]

    init(collectionPath: String, cacheDuration: TimeInterval = REPOSITORY_DEFAULT_CACHE_DURATION) {
        if FirebaseApp.app() == nil {
            FirebaseApp.configure()
        }
        let db = Firestore.firestore()
        self.collectionRef = db.collection(collectionPath)
        self.cacheDuration = cacheDuration
        self.lastUpdateKey = "last\(collectionPath.replacingOccurrences(of: "/", with: ""))Update"
    }

    func getAll(source: FirestoreSource? = nil, forceCache: Bool = false, completion: @escaping ([Model]) -> Void) {
        let source = source ?? (forceCache || shouldUseCache() ? .cache : .default)
        if source == .default { setLastUpdate() }
        collectionRef.getDocuments(source: source) { snapshot, error in
            if let error = error {
                Crashlytics.crashlytics().record(error: error)
                completion([])
                return
            }
            var items: [Model] = []
            snapshot?.documents.forEach { doc in
                if let model = try? doc.data(as: Model.self) {
                    items.append(model)
                    if let id = model.id { self.cache[id] = model }
                }
            }
            completion(items)
        }
    }

    func getById(_ id: String?) -> Model? {
        guard let id = id else { return nil }
        return cache[id]
    }

    private func shouldUseCache() -> Bool {
        if let lastUpdate = userDefaults.value(forKey: lastUpdateKey) as? TimeInterval {
            return Date().timeIntervalSince1970 - lastUpdate < cacheDuration
        }
        return false
    }

    private func setLastUpdate() {
        userDefaults.set(Date().timeIntervalSince1970, forKey: lastUpdateKey)
    }
}

// MARK: - Minimal Crypto helpers (scoped here to avoid Xcode project wiring)

class CryptoService {
    static let shared = CryptoService()
    private init() {}

    private var cachedKey: SymmetricKey?
    private func ensureKey() throws -> SymmetricKey {
        if let key = cachedKey { return key }
        guard let uid = Auth.auth().currentUser?.uid else { throw NSError(domain: "Auth", code: 401) }
        let digest = SHA256.hash(data: Data(uid.utf8))
        let key = SymmetricKey(data: Data(digest))
        cachedKey = key
        return key
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

class NumericDecryptorHelper {
    static let shared = NumericDecryptorHelper()
    private init() {}

    private var offset: UInt64 = 0
    private var multiplier: UInt64 = 1
    private var ready = false

    private func ensure() throws {
        if ready { return }
        guard let uid = Auth.auth().currentUser?.uid else { throw NSError(domain: "Auth", code: 401) }
        let digest = SHA256.hash(data: Data(uid.utf8))
        let hex = digest.map { String(format: "%02x", $0) }.joined()
        let offHex = String(hex.prefix(16))
        let mulHex = String(hex.dropFirst(16).prefix(16))
        let MAX_MULTIPLIER: UInt64 = 1 << 4
        let MAX_OFFSET: UInt64 = 1 << 16
        offset = (UInt64(offHex, radix: 16) ?? 0) % MAX_OFFSET
        multiplier = ((UInt64(mulHex, radix: 16) ?? 0) % MAX_MULTIPLIER) + 1
        ready = true
    }

    func decryptBool(_ value: Any?) -> Bool? {
        if let b = value as? Bool { return b }
        if let n = value as? NSNumber { return decryptNumber(n) as? Bool }
        if let s = value as? String { return Bool(s) }
        return nil
    }

    func decryptNumber(_ n: NSNumber) -> Any? {
        do { try ensure() } catch { return n }
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
            // Web stores ms; converting to seconds
            return Date(timeIntervalSince1970: TimeInterval(number) / 1000.0)
        default:
            return n
        }
    }
}
