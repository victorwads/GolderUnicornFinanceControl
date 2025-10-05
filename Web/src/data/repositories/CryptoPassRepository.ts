import { httpsCallable } from 'firebase/functions';

import { functions, getCurrentUser } from '@configs';

import { Progress } from '../crypt/progress';
import Encryptor, { Hash } from '../crypt/Encryptor';
import RepositoryWithCrypt from './RepositoryWithCrypt';
import getRepositories, { getEncryptor, RepoName, waitUntilReady } from './';

const encryptCallable = httpsCallable<EncryptPayload, DecryptPayload>(functions, 'cryptoPassEncrypt');
const decryptCallable = httpsCallable<DecryptPayload, EncryptPayload>(functions, 'cryptoPassDecrypt');

const CHUNK_SIZE = 100;
const SESSION_SECRET_KEY = 'crypto.secretHash.'

type EncryptPayload = { secretHash: string };
type DecryptPayload = { token: string };
type ProgressHandler = (progress: Progress | null) => void;

export default class CryptoPassRepository {

  public static readonly ENCRYPTION_VERSION = 1;

  constructor(
    public uid: string = getCurrentUser()?.uid || '',
    public onProgress?: ProgressHandler
  ) {}

  private get STORAGE_TOKEN_KEY() {
    return 'crypto.token.' + this.uid;
  }

  private get SESSION_SECRET_KEY() {
    return SESSION_SECRET_KEY + this.uid;
  }

  public static isAvailable(uid?: string): boolean {
    if(!uid) return false;
    return sessionStorage.getItem(SESSION_SECRET_KEY + uid) !== null;
  }

  public static getSyncHash(uid: string): Hash | null {
    let sessionHashHex = sessionStorage.getItem(SESSION_SECRET_KEY + uid);
    if (sessionHashHex)
      return Encryptor.hashFromHex(sessionHashHex);
    return null;
  }

  public async getHash(): Promise<Hash | null> {
    let sessionHashHex = CryptoPassRepository.getSyncHash(this.uid);
    if (sessionHashHex) { 
      return sessionHashHex;
    }

    const token = localStorage.getItem(this.STORAGE_TOKEN_KEY);
    if (!token) return null;
    return await this.decryptHash(token);
  }

  public async initSession(pass: string): Promise<void> {
    if (!pass) throw new Error('Informe uma senha de criptografia.');

    const secretHash = await Encryptor.createHash(pass);
    const { user } = getRepositories();
    
    await getEncryptor().initWithHash(secretHash);

    const { privateHash, fullyMigrated } = await user.getUserData();
    if (!privateHash || !fullyMigrated) {
      this.updateEncryption(secretHash);
    } else if (privateHash !== secretHash.hex) {
      throw new Error('Senha de criptografia inválida.');
    }

    const token = await this.encryptPassword(secretHash.hex);
    localStorage.setItem(this.STORAGE_TOKEN_KEY, token);
    sessionStorage.setItem(this.SESSION_SECRET_KEY, secretHash.hex);
  }

  public clear(): void {
    localStorage.removeItem(this.STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(this.SESSION_SECRET_KEY);
  }

  private async encryptPassword(secretHash: string): Promise<string> {
    const response = await encryptCallable({ secretHash });
    const token = response.data?.token;
    if (!token) throw new Error('Função de criptografia não retornou um token válido.');
    return token;
  }

  private async decryptHash(token: string): Promise<Hash> {
    const response = await decryptCallable({ token });
    const secretHash = response.data?.secretHash;
    if (!secretHash) throw new Error('Função de descriptografia não retornou o hash secreto.');

    sessionStorage.setItem(this.SESSION_SECRET_KEY, secretHash);

    return Encryptor.hashFromHex(secretHash);
  }

  async updateEncryption(secretHash: Hash) {
    const repos = Object
      .entries(getRepositories())
      .filter(([, repo]) => repo instanceof RepositoryWithCrypt);

    let prog: Progress = { current: 0, max: repos.length, filename: 'Carregando...', type: 'resave' };
    const progress = (p: Progress | null) => 
      this.onProgress?.(p ? { ...p } : null);
    progress(prog);

    await getRepositories().user.updateUserData({ privateHash: secretHash.hex });
    for (const [key, repo] of repos) {
      prog.filename = key;
      progress({ ...prog });

      console.log('Re-encrypting', key);
      await waitUntilReady(key as RepoName);

      const all: unknown[] = (repo as any).getCache();
      prog.sub = { current: 0, max: all.length };
      
      while (prog.sub.current < all.length) {
        const chunk = all.slice(prog.sub.current, prog.sub.current + CHUNK_SIZE);
        await (repo as RepositoryWithCrypt<any>).saveAll(chunk);
        prog.sub.current += chunk.length;
        progress({ ...prog });
      }
      prog.current += 1;
      delete prog.sub;
      progress({ ...prog });
    }

    await getRepositories().user.updateUserData({ fullyMigrated: true });
    progress(null);
  }
}
