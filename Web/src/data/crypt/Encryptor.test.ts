import { TextEncoder, TextDecoder } from 'util';
import crypto from 'crypto';

import Encryptor from './Encryptor';
Object.assign(globalThis, { TextDecoder, TextEncoder });
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', { value: crypto.webcrypto });
}

describe('FirebaseEncryptor', () => {
    const secretKey = 'my-secret-key';
    let encryptor = new Encryptor();

    beforeAll(async () => {
        await encryptor.init(secretKey);
    });

    test('encrypt and decrypt simple object', async () => {
        const originalObject = { name: 'John Doe', age: 30, day: new Date(), active: true, size: 1.5 };
        const encryptedObject = await encryptor.encrypt(originalObject);
        const decryptedObject = await encryptor.decrypt(encryptedObject);

        expect(decryptedObject).toEqual(originalObject);
        expect(encryptedObject).not.toEqual(originalObject);
    });

    test('encrypt and decrypt nested object', async () => {
        const originalObject = { user: { name: 'Alice', details: { age: 25, active: true, sizes: [0] } } };
        const encryptedObject = await encryptor.encrypt(originalObject);
        const decryptedObject = await encryptor.decrypt(encryptedObject);

        expect(decryptedObject).toEqual(originalObject);
        expect(encryptedObject).not.toEqual(originalObject);

        const untyped = encryptedObject as any;
        expect(untyped.encrypted).toBe(true);
        expect(untyped.user.encrypted).toBe(true);
        expect(untyped.user.details.encrypted).toBe(true);
    });

    test('ensure original object is not modified during encryption', async () => {
        const originalObject = { name: 'Immutable', age: 40, active: false, nest: { blas: 'data' }, ok: new Date() };
        const originalCopy = { ...originalObject };

        await encryptor.encrypt(originalObject);

        expect(originalObject).toEqual(originalCopy);
    });

    test('ensure error when using reserved key in object', async () => {
        const originalObject = { name: 'Immutable', age: 40, active: false, nest: { encrypted: 'data' } };

        await expect(
            encryptor.encrypt(originalObject)
        ).rejects.toThrow('Invalid crypt object using reserved key: encrypted');
    });

    test('ensure original object is not modified during decryption', async () => {
        const originalObject = { name: 'Immutable', age: 40 };
        const encryptedObject = await encryptor.encrypt(originalObject);
        const encryptedCopy = { ...encryptedObject };

        await encryptor.decrypt(encryptedObject);

        expect(encryptedObject).toEqual(encryptedCopy);
        expect((encryptedObject as any).encrypted).toBe(true);
    });

    test('encrypt and decrypt object with ignored keys', async () => {
        const originalObject = { name: 'Ignored', age: 50, skip: 'this' };
        const encryptedObject = await encryptor.encrypt(originalObject, ['skip']);

        expect(encryptedObject.skip).toBe(originalObject.skip);
        expect((encryptedObject as any).encrypted).toBe(true);
    });

    test('encrypt remove undefined values', async () => {
        const originalObject = { name: 'Undefined', age: undefined, active: true };
        const encryptedObject = await encryptor.encrypt(originalObject);

        expect(encryptedObject).not.toHaveProperty('age');
        expect((encryptedObject as any).encrypted).toBe(true);
    });

    test('decrypt should add toDate() on date types', async () => {
        const originalObject = { name: 'John Doe', day: new Date(), active: true, info: { now: new Date() } };
        const encryptedObject = await encryptor.encrypt(originalObject);
        const decryptedObject = await encryptor.decrypt(encryptedObject);

        expect(decryptedObject.day).toBeInstanceOf(Date);
        expect(decryptedObject.info.now).toBeInstanceOf(Date);
    });

});