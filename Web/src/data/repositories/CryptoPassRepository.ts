import { httpsCallable } from 'firebase/functions';

import { functions, getCurrentUser } from '@configs';

import { Progress } from '../crypt/progress';
import Encryptor, { Hash } from '../crypt/Encryptor';
import RepositoryWithCrypt from './RepositoryWithCrypt';
import getRepositories, { RepoName, waitUntilReady } from './';

const encryptCallable = httpsCallable<EncryptPayload, DecryptPayload>(functions, 'cryptoPassEncrypt');
const decryptCallable = httpsCallable<DecryptPayload, EncryptPayload>(functions, 'cryptoPassDecrypt');

const CHUNK_SIZE = 100;
const SESSION_SECRET_KEY = 'crypto.secretHash.'

type EncryptPayload = { secretHash: string };
type DecryptPayload = { token: string };
type ProgressHandler = (progress: Progress | null) => void;
type SaveOptions = {
  onProgress?: ProgressHandler;
};

export default class CryptoPassRepository {

  constructor(
    public uid: string = getCurrentUser()?.uid || ''
  ) {}

  private get STORAGE_TOKEN_KEY() {
    return 'crypto.token.' + this.uid;
  }

  private get SESSION_SECRET_KEY() {
    return SESSION_SECRET_KEY + this.uid;
  }

  public static isAvailable(uid: string): boolean {
    return sessionStorage.getItem(SESSION_SECRET_KEY + uid) !== null;
  }

  public async getHash(): Promise<Hash | null> {
    const sessionHashHex = sessionStorage.getItem(this.SESSION_SECRET_KEY);
    if (sessionHashHex) {
      return Encryptor.hashFromHex(sessionHashHex);
    }

    const token = localStorage.getItem(this.STORAGE_TOKEN_KEY);
    if (!token) return null;

    return await this.decryptHash(token);
  }

  public async initSession(pass: string, options?: SaveOptions): Promise<void> {
    if (!pass) throw new Error('Informe uma senha de criptografia.');

    const secretHash = await Encryptor.createHash(pass);
    const token = await this.encryptPassword(secretHash.hex);
    localStorage.setItem(this.STORAGE_TOKEN_KEY, token);
    sessionStorage.setItem(this.SESSION_SECRET_KEY, secretHash.hex);

    const { privateHash } = await getRepositories().user.getUserData();
    if (!privateHash) {
      await this.updateEncryption(secretHash, options?.onProgress);
    } else if (privateHash !== secretHash.hex) {
      throw new Error('Senha de criptografia inválida.');
    }
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

  async updateEncryption(secretHash: Hash, onProgress?: ProgressHandler) {
    const allRepos = getRepositories();
    await waitUntilReady(...Object.keys(allRepos) as RepoName[]);

    const newEncryptor = new Encryptor();
    await newEncryptor.initWithHash(secretHash);


    const repos = Object.entries(allRepos).filter(([, repo]) => repo instanceof RepositoryWithCrypt);
    let prog: Progress = { current: 0, max: repos.length, filename: '', type: 'resave' };
    onProgress?.(prog);
    for (const [key, repo] of repos) {
      const all: unknown[] = (repo as any).getCache();
      (repo as RepositoryWithCrypt<any>).config(newEncryptor);
      prog.filename = key;
      prog.sub = { current: 0, max: all.length };
      onProgress?.({ ...prog });
      
      while (prog.sub.current < all.length) {
        const chunk = all.slice(prog.sub.current, prog.sub.current + CHUNK_SIZE);
        await (repo as RepositoryWithCrypt<any>).saveAll(chunk);
        prog.sub.current += chunk.length;
        onProgress?.({ ...prog });
      }
      prog.current += 1;
      onProgress?.({ ...prog });
    }
    onProgress?.(null);

    await getRepositories().user.updateUserData({ privateHash: secretHash.hex });
  }
}
