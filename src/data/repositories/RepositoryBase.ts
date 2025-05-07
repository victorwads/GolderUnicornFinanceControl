import {
  getFirestore,
  // Types
  Firestore,
  Query, QuerySnapshot, CollectionReference,
  DocumentData, DocumentReference,
  // Actions
  addDoc, getDocsFromCache, getDocs, setDoc,
  collection, doc,
  Timestamp
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

import DocumentModel from "../models/DocumentModel";

interface DatabaseUse { queryReads: number, docReads: number,  writes: number}
interface DatabasesUse { remote: DatabaseUse, local: DatabaseUse, cache: DatabaseUse}
const DB_USE = "dbUse";
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day
const USE_CACHE: DatabasesUse = localStorage.getItem(DB_USE) !== null
 ? JSON.parse(localStorage.getItem(DB_USE) || '{}')
 : undefined

let updateUse = true;
export default abstract class BaseRepository<Model extends DocumentModel> {
  private lastUpdateKey: string;

  protected db: Firestore;
  protected ref: CollectionReference<any>;
  protected cacheDuration: number = 0;

  constructor(
    private collectionName: string,
    private modelClass: new (...args: any) => Model,
    cacheDuration: number|true = 0,
  ) {
    this.collectionName = this.parseCollectionName(collectionName);
    this.lastUpdateKey = `last${this.collectionName}Update`;
    this.db = getFirestore();
    this.ref = collection(this.db, this.collectionName);
    this.cacheDuration = cacheDuration === true ? DEFAULT_CACHE_DURATION : cacheDuration;
  }

  public async waitInit(): Promise<void> {
    this.validateCache();
    if (Object.keys(BaseRepository.cache[this.collectionName] || {}).length === 0) {
      await this.getAll();
    }
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
      let item = await this.fromFirestore(snap.id, snap.data);
      if (this.cacheDuration) {
        BaseRepository.cache[this.collectionName][snap.id] = item;
      }
      onItemDecoded(item);
      items.push(item);
    };
    this.postQueryProcess(items);

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
    let data = await this.toFirestore(model);
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

  protected postQueryProcess(items: Model[]): void {}

  protected async fromFirestore(id: string, data: DocumentData): Promise<Model> {
    function findAndReplaceTimestamps(obj: any): any {
      if(Array.isArray(obj)) return obj.map(findAndReplaceTimestamps);
      if (obj && typeof obj === "object") {
        if (obj instanceof Timestamp) return obj.toDate();
        if (obj.constructor === Object) {
          for (const key in obj) {
            obj[key] = findAndReplaceTimestamps(obj[key]);
          }
        }
      }
      return obj;
    }
    return Object.assign(
        new (this.modelClass)(),
        { id },
        findAndReplaceTimestamps(data), 
    );
  }

  protected async toFirestore(model: Model): Promise<DocumentData> {
      const data = { 
          ...model,
          _updatedAt: new Date(),
      } as any;
      delete data.id;
      return data
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

    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error("Invalid userId");

    return collectionName.replace(/\{userId\}/g, userId);
  }

  private static cache: { [key: string]: { [key: string]: DocumentData } } = {};
  private static readonly use: DatabasesUse = USE_CACHE || {
    remote: { queryReads: 0, docReads: 0,  writes: 0 },
    local: { queryReads: 0, docReads: 0, writes: 0 },
    cache: { queryReads: 0, docReads: 0, writes: 0 },
  }

  public static getDatabaseUse(): DatabasesUse {
    return BaseRepository.use;
  }

  protected static async updateUse(updater: (use: DatabasesUse) => void) {
    updater(BaseRepository.use);
    if (!updateUse) return;
    updateUse = false;
    setTimeout(() => {
      updateUse = true;
      localStorage.setItem(DB_USE, JSON.stringify(BaseRepository.use));
    }, 1000);
  }

}
