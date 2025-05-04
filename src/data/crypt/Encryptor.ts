class FirebaseEncryptor {
  private static ENCRYPTED_PREFIX = '$O';

  private secretKey: CryptoKey | null = null;
  private promisse: Promise<any> | null = null;
  private offset: number = 0;
  private multiplier: number = 1;

  async init(secretKey: string) {
    if (!secretKey) {
      throw new Error('A secret key is required for encryption.');
    }

    const hash = await sha256(secretKey);
    this.promisse = this.generateKey(hash.buffer).then((key) => this.secretKey = key);
    this.offset = parseInt(hash.hex.slice(0, 8), 16) % 1_000_000;
    this.multiplier = (parseInt(hash.hex.slice(8, 16), 16) % 100) + 1;
  }

  async waitInit(): Promise<void> {
    if (this.promisse) {
      await this.promisse;
    }
  }

  private async generateKey(hashBuffer: ArrayBuffer): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'raw', hashBuffer, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
    );
  }

  async encrypt<T extends {[key: string]: any}>(data: T, ignoreKeys: string[] = []): Promise<T> {
    await this.waitInit();
    return this.encryptData(data, ignoreKeys);
  }

  async encryptData(data: any, ignoreKeys: string[] = []): Promise<any> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map(item => this.encryptData(item)));
    }
    if(typeof data === 'number') {
      return this.encryptNumber(data);
    }
    if (typeof data === 'string') {
      return await this.encryptString(data) + FirebaseEncryptor.ENCRYPTED_PREFIX;
    }
    if (typeof data === 'object' && data !== null) {
      const encryptedData: any = {};
      for (const key in data) {
        if (ignoreKeys.includes(key)) continue;
        encryptedData[key] = await this.encryptData(data[key]);
      }
      return encryptedData;
    }
    throw new Error(`Invalid crypt object format for data: ${data}`);
  }

  async decrypt<T extends {[key: string]: any}>(data: T): Promise<T> {
    await this.waitInit();
    if (data.encrypted !== true) {
      return data;
    };
    return await this.decryptData(data);
  }

  private async decryptData(data: any): Promise<any> {
    if(null === data) return null;

    if (Array.isArray(data)) {
      return await Promise.all(data.map(item => this.decryptData(item)));
    }
    if(typeof data === 'number') {
      return this.decryptNumber(data);
    }
    if (typeof data === 'string' && data.startsWith(FirebaseEncryptor.ENCRYPTED_PREFIX)) {
      const encryptedValue = data.substring(FirebaseEncryptor.ENCRYPTED_PREFIX.length);
      return await this.decryptString(encryptedValue);
    }
    if (typeof data === 'object' && data !== null) {
      const decryptedData: any = {};
      for (const key in data) {
        data[key] = await this.decryptData(data[key]);
      }
      return decryptedData;
    }
    throw new Error(`Invalid crypt object format for data: ${data}`);
  }

  private async encryptString(value: string): Promise<string> {
    if (!this.secretKey) throw this.invalidKey;

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.secretKey,
      encoder.encode(value)
    );
    return `${Buffer.from(iv).toString('base64')}:${Buffer.from(encrypted).toString('base64')}`;
  }

  private async decryptString(value: string): Promise<string> {
    if (!this.secretKey) throw this.invalidKey;

    const [ivBase64, encryptedBase64] = value.split(':');
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.secretKey,
      encrypted
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  };

  private encryptNumber(number: number|Date): number {
    if (!this.secretKey) throw this.invalidKey;
    const isDate = number instanceof Date;
    const value = isDate ? number.getTime() : number;
    const encryptedNumber = (value + this.offset) * this.multiplier;
    const flaggedNumber = (encryptedNumber << 1) | (isDate ? 1 : 0);
    return flaggedNumber;
  }

  private decryptNumber(encryptedNumber: number): number|Date {
    if (!this.secretKey) throw this.invalidKey;
    const isDate = (encryptedNumber & 1) === 1;
    const originalNumber = (encryptedNumber >> 1) / this.multiplier - this.offset;
    return isDate ? new Date(originalNumber) : originalNumber;
  }

  private invalidKey = new Error('Secret key is not initialized.');
}

async function sha256(data: string): Promise<{
  buffer: ArrayBuffer;
  hex: string;
}> {
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

export default FirebaseEncryptor;

const EncryptorSingletone = new FirebaseEncryptor();
export { EncryptorSingletone };
