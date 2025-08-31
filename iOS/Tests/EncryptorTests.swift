import XCTest
import CryptoKit

fileprivate class TestEncryptor {
    private static let ENCRYPTED_PREFIX = "$O"
    private var key: SymmetricKey!
    private var number: TestNumericEncryptor!

    func initKey(_ secret: String) async {
        let digest = SHA256.hash(data: Data(secret.utf8))
        key = SymmetricKey(data: Data(digest))
        let hex = digest.map { String(format: "%02x", $0) }.joined()
        number = TestNumericEncryptor(hash: hex)
    }

    func encrypt(_ data: Any, ignore: [String] = [], depth: Int? = nil) -> Any {
        let next = depth.map { $0 - 1 }
        if let d = depth, d < 0 { return data }
        if data is NSNull { return data }
        if let arr = data as? [Any] { return arr.map { encrypt($0, ignore: ignore, depth: next) } }
        if let n = data as? Double { return number.encrypt(n) }
        if let b = data as? Bool { return number.encrypt(b) }
        if let s = data as? String { return Self.ENCRYPTED_PREFIX + encryptString(s) }
        if let d = data as? Date { return number.encrypt(d) }
        if var obj = data as? [String: Any?] {
            if let e = obj["encrypted"] as? Bool, e == false { obj.removeValue(forKey: "encrypted"); return obj }
            if obj.keys.contains("encrypted") { fatalError("Invalid crypt object using reserved key: encrypted") }
            var enc: [String: Any] = [:]
            for (k, v) in obj {
                if v == nil { continue }
                if ignore.contains(k) { enc[k] = v!; continue }
                let r = encrypt(v!, ignore: ignore, depth: next)
                enc[k] = r
            }
            enc["encrypted"] = true
            return enc
        }
        return data
    }

    func decrypt(_ data: Any, decode: (Any?) -> Any? = { $0 }) -> Any {
        if data is NSNull { return data }
        if let arr = data as? [Any] { return arr.map { decrypt($0, decode: decode) } }
        var result: Any = data
        switch data {
        case is Bool: break
        case let n as UInt64: result = number.decrypt(n)
        case let s as String:
            if s.hasPrefix(Self.ENCRYPTED_PREFIX) { result = decryptString(String(s.dropFirst(2))) }
        case var obj as [String: Any]:
            if obj["encrypted"] as? Bool != true { break }
            obj.removeValue(forKey: "encrypted")
            var dec: [String: Any] = [:]
            for (k, v) in obj { dec[k] = decrypt(v, decode: decode) }
            result = dec
        default:
            fatalError("error decrypting value")
        }
        return decode(result) ?? NSNull()
    }

    private func encryptString(_ value: String) -> String {
        let iv = (0..<12).map { _ in UInt8.random(in: 0...255) }
        let nonce = try! AES.GCM.Nonce(data: Data(iv))
        let sealed = try! AES.GCM.seal(Data(value.utf8), using: key, nonce: nonce)
        let ivB64 = Data(iv).base64EncodedString()
        let cipher = sealed.ciphertext + sealed.tag
        let cipherB64 = Data(cipher).base64EncodedString()
        return "\(ivB64):\(cipherB64)"
    }

    private func decryptString(_ value: String) -> String {
        let parts = value.split(separator: ":", maxSplits: 1).map(String.init)
        let iv = Data(base64Encoded: parts[0])!
        let raw = Data(base64Encoded: parts[1])!
        let nonce = try! AES.GCM.Nonce(data: iv)
        let tag = raw.suffix(16)
        let ciphertext = raw.prefix(raw.count - 16)
        let box = try! AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
        let plain = try! AES.GCM.open(box, using: key)
        return String(data: plain, encoding: .utf8)!
    }
}

final class EncryptorTests: XCTestCase {
    func testEncryptDecryptSimpleObject() async {
        let enc = TestEncryptor(); await enc.initKey("my-secret-key")
        let now = Date()
        let original: [String: Any?] = ["name": "John Doe", "age": 30, "day": now, "active": true, "size": 1.5]
        let encrypted = enc.encrypt(original) as! [String: Any]
        let decrypted = enc.decrypt(encrypted) as! [String: Any]
        XCTAssertEqual(original["name"] as! String, decrypted["name"] as! String)
        XCTAssertEqual(original["age"] as! Int, decrypted["age"] as! Int)
        XCTAssertEqual((original["day"] as! Date).timeIntervalSince1970, (decrypted["day"] as! Date).timeIntervalSince1970, accuracy: 0.001)
        XCTAssertEqual(original["active"] as! Bool, decrypted["active"] as! Bool)
    }

    func testEncryptDecryptNestedObject() async {
        let enc = TestEncryptor(); await enc.initKey("my-secret-key")
        let original: [String: Any?] = [
            "user": [
                "name": "Alice",
                "details": ["age": 25, "active": true, "sizes": [0]]
            ]
        ]
        let encrypted = enc.encrypt(original) as! [String: Any]
        let decrypted = enc.decrypt(encrypted) as! [String: Any]
        XCTAssertEqual(((decrypted["user"] as! [String: Any])["name"] as! String), "Alice")
        XCTAssertEqual(encrypted["encrypted"] as? Bool, true)
        let user = encrypted["user"] as! [String: Any]
        XCTAssertEqual(user["encrypted"] as? Bool, true)
        let details = user["details"] as! [String: Any]
        XCTAssertEqual(details["encrypted"] as? Bool, true)
    }

    func testImmutableDuringEncryption() async {
        let enc = TestEncryptor(); await enc.initKey("my-secret-key")
        var original: [String: Any?] = ["name": "Immutable", "age": 40, "active": false, "nest": ["blas": "data"], "ok": Date()]
        let snapshot = original
        _ = enc.encrypt(original)
        XCTAssertEqual((snapshot["name"] as! String), (original["name"] as! String))
    }

    func testReservedKeyError() async {
        let enc = TestEncryptor(); await enc.initKey("my-secret-key")
        let original: [String: Any?] = ["name": "Immutable", "age": 40, "active": false, "nest": ["encrypted": "data"]]
        XCTAssertThrowsError({ _ = enc.encrypt(original) }())
    }

    func testImmutableDuringDecryption() async {
        let enc = TestEncryptor(); await enc.initKey("my-secret-key")
        let original: [String: Any?] = ["name": "Immutable", "age": 40]
        let encrypted = enc.encrypt(original) as! [String: Any]
        let copy = encrypted
        _ = enc.decrypt(encrypted)
        XCTAssertEqual(copy.keys.count, encrypted.keys.count)
        XCTAssertEqual(encrypted["encrypted"] as? Bool, true)
    }

    func testIgnoredKeys() async {
        let enc = TestEncryptor(); await enc.initKey("my-secret-key")
        let original: [String: Any?] = ["name": "Ignored", "age": 50, "skip": "this"]
        let encrypted = enc.encrypt(original, ignore: ["skip"]) as! [String: Any]
        XCTAssertEqual(encrypted["skip"] as? String, original["skip"] as? String)
        XCTAssertEqual(encrypted["encrypted"] as? Bool, true)
    }

    func testRemoveUndefined() async {
        let enc = TestEncryptor(); await enc.initKey("my-secret-key")
        let original: [String: Any?] = ["name": "Undefined", "age": nil, "active": true]
        let encrypted = enc.encrypt(original) as! [String: Any]
        XCTAssertNil(encrypted["age"])
        XCTAssertEqual(encrypted["encrypted"] as? Bool, true)
    }

    func testDecryptDates() async {
        let enc = TestEncryptor(); await enc.initKey("my-secret-key")
        let original: [String: Any?] = ["name": "John Doe", "day": Date(), "active": true, "info": ["now": Date()]]
        let encrypted = enc.encrypt(original) as! [String: Any]
        let decrypted = enc.decrypt(encrypted) as! [String: Any]
        XCTAssertTrue(decrypted["day"] is Date)
        let info = decrypted["info"] as! [String: Any]
        XCTAssertTrue(info["now"] is Date)
    }
}

