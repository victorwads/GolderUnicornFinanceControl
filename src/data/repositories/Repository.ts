import {
  getFirestore,
  // Types
  Firestore, FirestoreDataConverter,
  Query, QuerySnapshot, CollectionReference,
  DocumentData, DocumentReference,
  // Actions
  addDoc, getDocsFromCache, getDocs, setDoc,
  collection, doc,
  runTransaction,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { EncryptorSingletone } from "../crypt/Encryptor";

interface DatabaseUse { queryReads: number, docReads: number,  writes: number}
interface DatabasesUse { remote: DatabaseUse, local: DatabaseUse, cache: DatabaseUse}
const DB_USE = "dbUse";
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day
const USE_CACHE: DatabasesUse = localStorage.getItem(DB_USE) !== null
 ? JSON.parse(localStorage.getItem(DB_USE) || '{}')
 : undefined

let updateUse = true;
export default abstract class BaseRepository<Model extends DocumentData> {
  private static cache: { [key: string]: { [key: string]: DocumentData } } = {};
  private static cacheStates: { [key: string]: Promise<any> } = {};
  private static readonly use: DatabasesUse = USE_CACHE || {
    remote: { queryReads: 0, docReads: 0,  writes: 0 },
    local: { queryReads: 0, docReads: 0, writes: 0 },
    cache: { queryReads: 0, docReads: 0, writes: 0 },
  }

  private static async updateUse(updater: (use: DatabasesUse) => void) {
    updater(BaseRepository.use);
    if (!updateUse) return;
    updateUse = false;
    setTimeout(() => {
      updateUse = true;
      localStorage.setItem(DB_USE, JSON.stringify(BaseRepository.use));
    }, 1000);
  }

  private encryptQueeue: Model[] = [];
  private lastUpdateKey: string;
  private useUser: boolean = false

  protected db: Firestore;
  protected ref: CollectionReference<any>;
  protected converter: FirestoreDataConverter<Model>;
  protected cacheDuration: number = 0;

  constructor(
    private collectionName: string,
    firestoreConverter: FirestoreDataConverter<Model>,
    cacheDuration: number|true = 0,
  ) {
    this.collectionName = this.parseCollectionName(collectionName);
    this.lastUpdateKey = `last${this.collectionName}Update`;
    this.db = getFirestore();
    this.ref = collection(this.db, this.collectionName);
    this.converter = firestoreConverter;
    this.cacheDuration = cacheDuration === true ? DEFAULT_CACHE_DURATION : cacheDuration;
  }

  public async waitInit(): Promise<void> {
    this.validateCache();
    if (!BaseRepository.cache[this.collectionName]) {
      BaseRepository.cacheStates[this.collectionName] = this.getAll();
    }
    await BaseRepository.cacheStates[this.collectionName];
  }

  public async getAll(
    forceCache: boolean = false,
    queryBuilder: (ref: CollectionReference<Model>) => Query<Model> = (ref) => ref,
    onItemDecoded: (model: Model) => void = () => {}
  ): Promise<Model[]> {
    let result: QuerySnapshot<Model>;
    let setLastUpdate = () => {};
    if (forceCache || this.shouldUseCache()) {
      result = await getDocsFromCache(queryBuilder(this.ref));
    } else {
      result = await getDocs(queryBuilder(this.ref));
      setLastUpdate = () => this.setLastUpdate();
    }
    if (result.metadata.fromCache && result.docs.length === 0 && localStorage.getItem(this.lastUpdateKey)) {
      localStorage.removeItem(this.lastUpdateKey);
      return this.getAll(forceCache, queryBuilder, onItemDecoded);
    }
    if (!BaseRepository.cache[this.collectionName]) {
      BaseRepository.cache[this.collectionName] = {};
    }

    const encryptedItems = result.docs.map(snap => ({id: snap.id, data: snap.data()}));
    const items = [];

    for(const snap of encryptedItems) {
      let item = await this.handleSnapDecryption(snap.id, snap.data);
      if (this.cacheDuration) {
        BaseRepository.cache[this.collectionName][snap.id] = item;
      }
      onItemDecoded(item);
      items.push(item);
    };
    this.proccessEncryptionQueue();

    if (this.cacheDuration) setLastUpdate();
    BaseRepository.updateUse((use) => {
      const useInfo: keyof DatabasesUse = result.metadata.fromCache ? 'local' : 'remote';
      use[useInfo].queryReads++;
      use[useInfo].docReads += result.docs.length;
    });

    return items;
  }

  public getLocalById(id?: string): Model | undefined {
    this.validateCache();
    BaseRepository.updateUse((use) => {
      use.cache.docReads++;
    });
    return BaseRepository.cache[this.collectionName][id ?? ""] as Model;
  }

  public async set(model: Model, id?: string): Promise<DocumentReference<Model>> {
    let data = await this.handleSnapEncryption(model);
    let result;
    if(id) {
      result = doc(this.ref, id);
      await setDoc(result, data);
    } else {
      result = await addDoc(this.ref, data);
      (model as any).id = result.id;
    }

    BaseRepository.updateUse((use) => {
      use.remote.writes++;
      if (this.cacheDuration) {
        use.cache.writes++;
        BaseRepository.cache[this.collectionName][model.id] = model;
      }
    });
    return result;
  }

  public getCache(): Model[] {
    this.validateCache();
    const result = Object.values(BaseRepository.cache[this.collectionName] || {}) as Model[];

    BaseRepository.updateUse((use) => {
      use.cache.queryReads++;
      use.cache.docReads += result.length;
    });
    return result;
  }

  private shouldUseCache(): boolean {
    const lastUpdate = Number(localStorage.getItem(this.lastUpdateKey));
    return (this.cacheDuration > 0) && ((Date.now() - (lastUpdate || 0)) < this.cacheDuration);
  }

  private setLastUpdate(): void {
    localStorage.setItem(this.lastUpdateKey, Date.now().toString());
  }

  private validateCache(): void {
    if (!this.cacheDuration) {
      throw new Error("Local cache is not enabled for this repository");
    }
  }

  private parseCollectionName(collectionName: string): string {
    if (!collectionName.includes("{userId}")) return collectionName;

    this.useUser = true;
    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error("Invalid userId");

    return collectionName.replace(/\{userId\}/g, userId);
  }

  private async handleSnapDecryption(id: string, data: any): Promise<Model> {
    if (data.encrypted === true) {
      const newData = await EncryptorSingletone.decrypt(data);
      return this.converter.fromFirestore({ id, data: () => newData} as any);
    }
    const model = this.converter.fromFirestore({ id, data: () => data} as any);

    if(this.useUser) this.encryptQueeue.push(model);
    return model;
  }

  private async handleSnapEncryption(model: Model): Promise<DocumentData> {
    const data = this.converter.toFirestore(model);
    return await EncryptorSingletone.encrypt(data);
  }

  private proccessEncryptionQueue() {
    if (this.encryptQueeue.length > 0) {
      runTransaction(this.db, async (transaction) => {
        let model = this.encryptQueeue.pop()
        while (model) {
          const data = this.converter.toFirestore(model);
          const encryptedData = await EncryptorSingletone.encrypt(data);
          transaction.set(doc(this.ref, model.id), encryptedData);
          BaseRepository.updateUse((use) => {
            use.remote.writes++;
          });      

          model = this.encryptQueeue.pop();
        }
      }).catch((error) => {
        localStorage.removeItem(this.lastUpdateKey);
        console.error("Transaction failed: ", error);
      });
    }
  }
}
