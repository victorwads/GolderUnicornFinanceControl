import NumericEncryptor from './NumericEncryptor';

describe('NumericEncryptor', () => {
  const hash = 'a'.repeat(64).split('').map((_, i) => (i % 16).toString(16)).join('');
  const encryptor = new NumericEncryptor(hash);

  test('encrypt and decrypt integers', () => {
    for (let i = 0; i < 10000; i++) {
      const originalValue = Math.floor(Math.random() * (NumericEncryptor.MAX_SAFE_INTEGER));
      const encryptedValue = encryptor.encrypt(originalValue);
      const decryptedValue = encryptor.decrypt(encryptedValue);
      expect(decryptedValue).toBe(originalValue);
    }
  });

  test('encrypt and decrypt floats with precision loss beyond 3 decimal places', () => {
    const originalValue = 42.123456;
    const encryptedValue = encryptor.encrypt(originalValue);
    const decryptedValue = encryptor.decrypt(encryptedValue);
    expect(decryptedValue).toBeCloseTo(originalValue, 3);
  });

  test('encrypt and decrypt dates', () => {
    const originalValue = new Date();
    const encryptedValue = encryptor.encrypt(originalValue);
    const decryptedValue = encryptor.decrypt(encryptedValue) as any;

    expect(decryptedValue).toBeInstanceOf(Date);
    expect(decryptedValue.toDateString()).toBe(originalValue.toDateString());
    expect(decryptedValue.getTime()).toBe(originalValue.getTime());
  });

  test('encrypt and decrypt booleans', () => {
    const encryptedTrue = encryptor.encrypt(true);
    const encryptedFalse = encryptor.encrypt(false);

    expect(encryptor.decrypt(encryptedTrue)).toBe(true);
    expect(encryptor.decrypt(encryptedFalse)).toBe(false);
  });

  test('sequential true boolean encryption produces different values', () => {
    let last = 0;
    for (let i = 0; i < 100; i++) {
      const encryptedTrue = encryptor.encrypt(true);

      expect(last).not.toBe(encryptedTrue);
      expect(true).toBe(encryptor.decrypt(encryptedTrue));
      last = encryptedTrue;
    }
  });

  test('sequential false boolean encryption produces different values', () => {
    let last = 0;
    for (let i = 0; i < 100; i++) {
      const encryptedFalse = encryptor.encrypt(false);

      expect(last).not.toBe(encryptedFalse);
      expect(false).toBe(encryptor.decrypt(encryptedFalse));
      last = encryptedFalse;
    }
  });

  test('make sure that legacy dates, numbers on database will never stop working', () => {
    const dates = [
      new Date('2023-10-01T00:00:00Z'), new Date('3023-10-02T00:00:00Z'),
      new Date('2623-10-03T12:50:03Z'), new Date('5023-10-04T12:45:03Z'),
    ];
    const referenceEncryptedValues = [
      6784473652723, 133012454452723, 82521861664723, 385468945264723
    ];

    for(let i = 0; i < dates.length; i++) {
      const encryptedValue = encryptor.encrypt(dates[i]);
      expect(encryptedValue).toEqual(referenceEncryptedValues[i]);

      const decryptedValue = encryptor.decrypt(referenceEncryptedValues[i]);
      expect(decryptedValue).toEqual(dates[i]);
    }
  });

  test('make sure that legacy floats on database will never stop working', () => {
    const floats = [5436.3466, 643634.46, 643634, 6456547, 7457.4567];
    const referenceEncryptedValues = [21798105, 2574590561, 2627256, 25878908, 29882545];

    for(let i = 0; i < floats.length; i++) {
      const encryptedValue = encryptor.encrypt(floats[i]);
      expect(encryptedValue).toEqual(referenceEncryptedValues[i]);

      const decryptedValue = encryptor.decrypt(referenceEncryptedValues[i]);
      expect(decryptedValue).toBeCloseTo(floats[i]);
    }
  });

  test('make sure that legacy booleans on database will never stop working', () => {
    const booleans = [true, false, false, true, true, false, true, false];
    const referenceEncryptedValues = [
      98263021426, 108363255958, 130252788486, 152473555630,
      169619122178, 173669240510, 195887234662, 211785704522
    ];

    for(let i = 0; i < booleans.length; i++) {
      const decryptedValue = encryptor.decrypt(referenceEncryptedValues[i]);
      expect(decryptedValue).toEqual(booleans[i]);
    }
  });

});