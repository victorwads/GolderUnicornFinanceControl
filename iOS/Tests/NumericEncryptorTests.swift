import XCTest

fileprivate class TestNumericEncryptor {
    private let MASK: UInt64 = 0b11
    private let MASK_SIZE: UInt64 = 2
    private let FLOAT_PRECISION: Double = 1000
    private let MAX_MULTIPLIER: Double = pow(2, 4)
    private let MAX_OFFSET: Double = pow(2, 16)

    private var offset: UInt64
    private var multiplier: UInt64
    private var booleanOffset: UInt64

    init(hash: String) {
        precondition(hash.count == 64)
        let offHex = String(hash.prefix(16))
        let mulHex = String(hash.dropFirst(16).prefix(16))
        // Emulate JS parseInt precision by using Doubles for modulo
        let offDouble = Double(UInt64(offHex, radix: 16)!)
        let mulDouble = Double(UInt64(mulHex, radix: 16)!)
        self.offset = UInt64(offDouble.truncatingRemainder(dividingBy: MAX_OFFSET))
        self.multiplier = UInt64(mulDouble.truncatingRemainder(dividingBy: MAX_MULTIPLIER)) + 1
        self.booleanOffset = self.offset
    }

    func encrypt(_ value: Any) -> UInt64 {
        let encoded = encode(value)
        return encoded &* UInt64(multiplier) &+ UInt64(offset)
    }

    func decrypt(_ encrypted: UInt64) -> Any {
        let encoded = (encrypted &- UInt64(offset)) / UInt64(multiplier)
        return decode(encoded)
    }

    private func encode(_ value: Any) -> UInt64 {
        if let b = value as? Bool { return flag(createRandomBoolean(b), 2) }
        if let n = value as? Double {
            if n.rounded() == n { return flag(UInt64(n), 0) }
            return flag(UInt64((n * FLOAT_PRECISION).rounded(.towardZero)), 1)
        }
        if let n = value as? Int { return flag(UInt64(n), 0) }
        if let d = value as? Date { return flag(UInt64(d.timeIntervalSince1970 * 1000.0), 3) }
        fatalError("Invalid number or type")
    }

    private func decode(_ value: UInt64) -> Any {
        let flag = value & MASK
        let number = value >> MASK_SIZE
        switch flag {
        case 0: return Double(number)
        case 1: return Double(number) / FLOAT_PRECISION
        case 2: return decodeRandomBoolean(number)
        case 3: return Date(timeIntervalSince1970: TimeInterval(number) / 1000.0)
        default: fatalError("Invalid flag")
        }
    }

    private func flag(_ value: UInt64, _ flag: UInt64) -> UInt64 {
        return (value << MASK_SIZE) | flag
    }

    private func createRandomBoolean(_ v: Bool) -> UInt64 {
        var noise = UInt64.random(in: 0..<(1<<32))
        let pos = Int(booleanOffset % 0b11111)
        booleanOffset &+= 1
        if v { noise |= (1 << pos) } else { noise &= ~UInt64(1 << pos) }
        return (UInt64(pos) << 32) | noise
    }

    private func decodeRandomBoolean(_ value: UInt64) -> Bool {
        let idx = Int(value >> 32)
        let bit = (value >> idx) & 1
        return bit == 1
    }
}

final class NumericEncryptorTests: XCTestCase {
    private func testHash() -> String {
        return (0..<64).map { String($0 % 16, radix: 16) }.joined()
    }

    func testEncryptDecryptIntegers() {
        let enc = TestNumericEncryptor(hash: testHash())
        for _ in 0..<1000 {
            let original = UInt64.random(in: 0..<1_000_000_000)
            let e = enc.encrypt(Double(original))
            let d = enc.decrypt(e) as! Double
            XCTAssertEqual(Double(original), d)
        }
    }

    func testEncryptDecryptFloats() {
        let enc = TestNumericEncryptor(hash: testHash())
        let original = 42.123456
        let e = enc.encrypt(original)
        let d = enc.decrypt(e) as! Double
        XCTAssertEqual(original, d, accuracy: 0.001)
    }

    func testEncryptDecryptDates() {
        let enc = TestNumericEncryptor(hash: testHash())
        let original = Date()
        let e = enc.encrypt(original)
        let d = enc.decrypt(e) as! Date
        XCTAssertEqual(original.timeIntervalSince1970, d.timeIntervalSince1970, accuracy: 0.001)
    }

    func testSequentialBooleanRandomness() {
        let enc = TestNumericEncryptor(hash: testHash())
        var last: UInt64 = 0
        for _ in 0..<100 {
            let e = enc.encrypt(true)
            XCTAssertNotEqual(last, e)
            XCTAssertTrue(enc.decrypt(e) as! Bool)
            last = e
        }
    }

    func testLegacyValues() {
        let enc = TestNumericEncryptor(hash: testHash())
        let dates = [
            Date(timeIntervalSince1970: 1696118400),
            Date(timeIntervalSince1970: 33065472000),
            Date(timeIntervalSince1970: 28014990000),
            Date(timeIntervalSince1970: 173852190300),
        ]
        let referenceDateEncrypted: [UInt64] = [6784473652723, 133012454452723, 82521861664723, 385468945264723]
        for (i, d) in dates.enumerated() {
            let e = enc.encrypt(d)
            XCTAssertEqual(referenceDateEncrypted[i], e)
            let back = enc.decrypt(referenceDateEncrypted[i]) as! Date
            XCTAssertEqual(d.timeIntervalSince1970, back.timeIntervalSince1970, accuracy: 0.001)
        }

        let floats: [Double] = [5436.3466, 643634.46, 643634, 6456547, 7457.4567]
        let refFloats: [UInt64] = [21798105, 2574590561, 2627256, 25878908, 29882545]
        for (i, f) in floats.enumerated() {
            let e = enc.encrypt(f)
            XCTAssertEqual(refFloats[i], e)
            let back = enc.decrypt(refFloats[i]) as! Double
            XCTAssertEqual(f, back, accuracy: 0.01)
        }

        let booleans = [true, false, false, true, true, false, true, false]
        let refBools: [UInt64] = [98263021426, 108363255958, 130252788486, 152473555630, 169619122178, 173669240510, 195887234662, 211785704522]
        for (i, b) in booleans.enumerated() {
            let back = enc.decrypt(refBools[i]) as! Bool
            XCTAssertEqual(b, back)
        }
    }
}

