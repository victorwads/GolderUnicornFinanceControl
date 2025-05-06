import NumericEncryptor from "./NumericEncryptor";

type Map = { [key: string]: any;};

export default class FirebaseEncryptor {
  private static ENCRYPTED_PREFIX = '$O';

  private secretKey: CryptoKey | null = null;
  private numberHandler: NumericEncryptor | null = null;

  async init(secretKey: string) {
    if (!secretKey) throw new Error('A secret key is required for encryption.');

    this.secretKey = null;
    const hash = await sha256(secretKey);
    this.numberHandler = new NumericEncryptor(hash.hex);
    this.secretKey = await this.generateKey(hash.buffer).then((key) => this.secretKey = key);
  }

  async encrypt<T extends Map>(data: T, ignoreKeys: string[] = []): Promise<T> {
    if (!this.secretKey) throw this.invalidKey;

    return this.encryptData(data, ignoreKeys);
  }

  async decrypt<T extends {[key: string]: any}>(data: T): Promise<T> {
    if (!this.secretKey) throw this.invalidKey;

    return await this.decryptData(data);
  }

  private async encryptData(data: any, ignoreKeys: string[] = []): Promise<any> {
    if (Array.isArray(data)) {
      return await Promise.all(
        data
        .filter(item => item !== undefined)
        .map(item => this.encryptData(item))
      );
    }

    switch (typeof data) {
      case 'number':
      case 'boolean': 
        return this.numberHandler?.encrypt(data);
      case 'string':
        return FirebaseEncryptor.ENCRYPTED_PREFIX + await this.encryptString(data);
      case 'object':
        if (data instanceof Date) {
          return this.numberHandler?.encrypt(data);
        }

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
          encryptedData[key] = await this.encryptData(sourceData[key]);
        }
        encryptedData.encrypted = true;
        return encryptedData;  
    }
    throw new Error(`Invalid crypt value of type: ${typeof data}`);
  }

  private async decryptData(data: any): Promise<any> {
    if(null === data) return null;
    if (Array.isArray(data)) {
      return await Promise.all(data.map(item => this.decryptData(item)));
    }

    switch (typeof data) {
      case 'number': return this.numberHandler?.decrypt(data);
      case 'boolean': return data;
      case 'string':
        if (data.startsWith(FirebaseEncryptor.ENCRYPTED_PREFIX)) {
          const encryptedValue = data.substring(FirebaseEncryptor.ENCRYPTED_PREFIX.length);
          return await this.decryptString(encryptedValue);
        }
        return data;
      case 'object':
        if (data.encrypted !== true) {
          return data;
        }
        const sourceData = {...data};
        const decryptedData: any = {};
        delete sourceData.encrypted;
        for (const key in sourceData) {
          decryptedData[key] = await this.decryptData(sourceData[key]);
          if (decryptedData[key] instanceof Date) {
            (decryptedData[key] as any).toDate = () => decryptedData[key];
          }
        }
        return decryptedData;      
    }
    throw new Error(`error decrypting value of type: ${typeof data}`);
  }

  private async encryptString(value: string): Promise<string> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, this.secretKey!, encoder.encode(value)
    );

    const ivBase64 = btoa(String.fromCharCode(...iv));
    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));  
    return `${ivBase64}:${encryptedBase64}`;
  }

  private async decryptString(value: string): Promise<string> {
    const [ivBase64, encryptedBase64] = value.split(':');
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv }, this.secretKey!, encrypted
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  };

  private async generateKey(hashBuffer: ArrayBuffer): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'raw', hashBuffer, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
    );
  }

  private invalidKey = new Error('Secret key is not initialized.');
}

async function sha256(data: string): Promise<{buffer: ArrayBuffer; hex: string;}> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(data);
  const buffer = await crypto.subtle.digest('SHA-256', keyData);
  return {
    buffer,
    hex: Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join(''),
  }
}

const EncryptorSingletone = new FirebaseEncryptor();
export { EncryptorSingletone };
