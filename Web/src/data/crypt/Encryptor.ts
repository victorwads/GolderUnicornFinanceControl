import NumericEncryptor from "./NumericEncryptor";

type Map = { [key: string]: any };
export type Hash = { buffer: ArrayBuffer; hex: string; }

type EncryptorVersion = boolean | number | undefined;
  
export default class Encryptor {

  constructor(
    private readonly version: EncryptorVersion = true
  ) {}

  private static ENCRYPTED_PREFIX = '$O';

  private secretKeys: Record<string, CryptoKey> = {};
  private numberHandler: NumericEncryptor | null = null;

  async initWithPass(pass: string, version: EncryptorVersion = this.version) {
    if (!pass) throw new Error('A password is required for encryption.');

    const hash = await Encryptor.createHash(pass);
    this.initWithHash(hash, version);
  }

  async initWithHash(hash: Hash, version: EncryptorVersion = this.version) {
    this.numberHandler = new NumericEncryptor(hash.hex);
    this.secretKeys[String(version)] = await this.generateKey(hash.buffer);
  }

  async encrypt<T extends Map>(data: T, ignoreKeys: string[] = [], maxDepth?: number): Promise<T> {
    return this.encryptData(data, ignoreKeys, maxDepth);
  }

  async decrypt<T extends {[key: string]: any}>(data: T, customValueDecoder: (value: any) => any = (v) => v): Promise<T> {
    return await this.decryptData(data, customValueDecoder, data.encrypted);
  }

  private async encryptData(data: any, ignoreKeys: string[] = [], maxDepth?: number): Promise<any> {
    const hasMaxDepth = typeof maxDepth === 'number';
    const nextDepth = hasMaxDepth ? maxDepth - 1 : undefined;
    if (hasMaxDepth && maxDepth < 0) return data;
    if (null === data) return null;
    if (Array.isArray(data)) {
      return await Promise.all(
        data
        .filter(item => item !== undefined)
        .map(item => this.encryptData(item, ignoreKeys, nextDepth))
      );
    }

    switch (typeof data) {
      case 'number':
      case 'boolean': 
        return Number.isNaN(data) ? undefined : this.numberHandler?.encrypt(data);
      case 'string':
        return Encryptor.ENCRYPTED_PREFIX + await this.encryptString(data);
      case 'object':
        if (data instanceof Date) return this.numberHandler?.encrypt(data);
        if (data.constructor !== Object) return data;
        if (data.encrypted === false) {
          delete data.encrypted;
          return data
        };
        if(Object.keys(data).includes('encrypted'))
          throw new Error('Invalid crypt object using reserved key: encrypted');

        const sourceData = {...data};
        const encryptedData: any = {};
        for (const key in sourceData) {
          if(sourceData[key] === undefined) continue;
          if(ignoreKeys.includes(key)) {
            encryptedData[key] = sourceData[key];
            continue
          };
          const result = await this.encryptData(sourceData[key], ignoreKeys, nextDepth);
          if (result === undefined) continue;
          encryptedData[key] = result;
        }
        encryptedData.encrypted = this.version;
        return encryptedData;  
    }
    throw new Error(`Invalid crypt value of type: ${typeof data}`);
  }

  private async decryptData(data: any, customValueDecoder: (value: any) => any, version: EncryptorVersion): Promise<any> {
    if(null === data) return null;
    if (Array.isArray(data)) {
      return await Promise.all(data.map(item => this.decryptData(item, customValueDecoder, version)));
    }

    let result: any = data;
    switch (typeof data) {
      case 'boolean': break;
      case 'number': result = this.numberHandler?.decrypt(data); break;
      case 'string':
        if (data.startsWith(Encryptor.ENCRYPTED_PREFIX))
          result = await this.decryptString(data.substring(Encryptor.ENCRYPTED_PREFIX.length), version);
        break;
      case 'object':
        if (!Object.keys(this.secretKeys).includes(String(data.encrypted))) break;
        result = await this.decryptObject(data, customValueDecoder, data.encrypted);
        break;
      default:
        throw new Error(`error decrypting value of type: ${typeof data}`);
    }

    return customValueDecoder(result);
  }

  private async decryptObject(data: any, customValueDecoder: (value: any) => any, version: EncryptorVersion): Promise<any> {
    const sourceData = {...data};
    const decryptedData: any = {};
    delete sourceData.encrypted;
    for (const key in sourceData) {
      decryptedData[key] = customValueDecoder(
        await this.decryptData(sourceData[key], customValueDecoder, version)
      );
    }
    return decryptedData;
  }

  private async encryptString(value: string): Promise<string> {
    const secretKey = this.secretKeys[String(this.version)];
    if (!secretKey) throw new Error('Secret key is not initialized for version: ' + this.version);

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, secretKey, encoder.encode(value)
    );

    const ivBase64 = btoa(String.fromCharCode(...iv));
    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));  
    return `${ivBase64}:${encryptedBase64}`;
  }

  private async decryptString(value: string, version: EncryptorVersion): Promise<string> {
    const secretKey = this.secretKeys[String(version)];
    if (!secretKey) throw new Error('Secret key is not initialized for version: ' + this.version);

    try {
      const [ivBase64, encryptedBase64] = value.split(':');
      const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
      const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv }, secretKey!, encrypted
      );
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch(err) {
      console.error("Error decrypting string", err);
      return value;
    }
  }

  private async generateKey(hashBuffer: ArrayBuffer): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'raw', hashBuffer, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
    );
  }

  private invalidKey = new Error('Secret key is not initialized.');

  public static hashFromHex(hexHash: string): Hash {
    const { buffer} = Uint8Array
      .from(hexHash.match(/.{1,2}/g)!
      .map(byte => parseInt(byte, 16)))
    return { 
      hex: hexHash,
      buffer
    }
  }

  public static async createHash(password: string): Promise<Hash> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(password);
    const buffer = await crypto.subtle.digest('SHA-256', keyData);
    return {
      buffer,
      hex: Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(''),
    }
  }
}
