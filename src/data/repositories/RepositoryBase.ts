import {
  getFirestore,
  // Types
  Firestore,
  CollectionReference, Timestamp,
  DocumentData, DocumentReference,
  // Actions
  addDoc, getDocsFromCache, getDocs, setDoc,
  collection, doc, query, orderBy, limit, where, increment,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

import DocumentModel from "../models/DocumentModel";

const queryField: keyof DocumentModel = "_updatedAt";
interface DatabaseUse { queryReads: number, docReads: number,  writes: number}
export interface DatabasesUse { remote: DatabaseUse, local: DatabaseUse, cache: DatabaseUse}
const createEmptyUse = (): DatabasesUse => ({
  remote: { queryReads: 0, docReads: 0,  writes: 0 },
  local: { queryReads: 0, docReads: 0, writes: 0 },
  cache: { queryReads: 0, docReads: 0, writes: 0 },
});
const DB_USE = "dbUse";;
const SAVED_CACHE = localStorage.getItem(DB_USE);
let updateUse = true; let saveUse = true; 

export default abstract class BaseRepository<Model extends DocumentModel> {
  protected db: Firestore;
  protected ref: CollectionReference<any>;
  
  constructor(
    private collectionName: string,
    private modelClass: new (...args: any) => Model
  ) {
    this.collectionName = this.parseCollectionName(collectionName);
    this.db = getFirestore();
    this.ref = collection(this.db, this.collectionName);
    if (!BaseRepository.cache[this.collectionName]) {
      BaseRepository.cache[this.collectionName] = {};
    }
  }

  public async waitInit(): Promise<void> {
    if (Object.keys(BaseRepository.cache[this.collectionName] || {}).length === 0) {
      await this.getAll();
    }
  }

  public async getAll(): Promise<Model[]> {
    await this.updateLocalCache();

    const queryResult = await getDocsFromCache(this.ref);
    BaseRepository.updateUse((use) => {
      use.local.queryReads++;
      use.local.docReads += queryResult.docs.length;
    });

    const items = [];    
    for(const snap of queryResult.docs) {
      let item = await this.fromFirestore(snap.id, snap.data());
      BaseRepository.cache[this.collectionName][snap.id] = item;
      items.push(item);
    };
    this.postQueryProcess(items);

    return items;
  }

  public getLocalById(id?: string): Model | undefined {
    BaseRepository.updateUse((use) => {
      use.cache.docReads++;
    });
    return BaseRepository.cache[this.collectionName][id ?? ""] as Model;
  }

  public async set(model: Model, id?: string, merge: boolean = false): Promise<DocumentReference<Model>> {
    let data = await this.toFirestore(model);
    let result;
    if(id) {
      result = doc(this.ref, id);
      await setDoc(result, data, { merge });
    } else {
      result = await addDoc(this.ref, data);
      (model as any).id = result.id;
    }

    if(!merge) {
      BaseRepository.cache[this.collectionName][model.id] = model;
      BaseRepository.updateUse((use) => {
        use.remote.writes++;
        use.local.writes++;
        use.cache.writes++;
      });
    }
    return result;
  }

  public getCache(): Model[] {
    const result = Object.values(BaseRepository.cache[this.collectionName] || {}) as Model[];

    BaseRepository.updateUse((use) => {
      use.cache.queryReads++;
      use.cache.docReads += result.length;
    });
    return result;
  }

  protected async getLastUpdatedValue(): Promise<any> {
    const queryResult = await getDocsFromCache(query(this.ref, orderBy(queryField, "desc"), limit(1)));
    BaseRepository.updateUse((use) => {
      use.local.queryReads++;
      use.local.docReads += queryResult.docs.length;
    });
    return queryResult.docs[0]?.data()[queryField];
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

  private async updateLocalCache(): Promise<void> {
    const lastUpdated = await this.getLastUpdatedValue();
    let queryResult;
    if(lastUpdated) {
      queryResult = await getDocs(query(this.ref, where(queryField, ">", lastUpdated)));
    } else {
      queryResult = await getDocs(this.ref);
    }

    BaseRepository.updateUse((use) => {
      use.remote.queryReads++;
      use.remote.docReads += queryResult.docs.length;
    });
  }

  private parseCollectionName(collectionName: string): string {
    if (!collectionName.includes("{userId}")) return collectionName;

    const userId = getAuth().currentUser?.uid;
    if (!userId) throw new Error("Invalid userId");

    return collectionName.replace(/\{userId\}/g, userId);
  }

  private static cache: { [key: string]: { [key: string]: DocumentData } } = {};
  private static use: DatabasesUse = SAVED_CACHE ? JSON.parse(SAVED_CACHE) : createEmptyUse();

  public static getDatabaseUse(): DatabasesUse {
    return BaseRepository.use;
  }

  public static updateUserUse = async (data: DocumentData) => {};
  protected static async updateUse(updater: (use: DatabasesUse) => void) {
    updater(BaseRepository.use);

    const use = BaseRepository.use;
    if (saveUse && (use.remote.writes > 0 || use.remote.docReads > 10)) {
      saveUse = false;
      setTimeout(async () => {
        await BaseRepository.updateUserUse({
          remote: {queryReads: increment(use.remote.queryReads), docReads: increment(use.remote.docReads), writes: increment(use.remote.writes)},
          local: {queryReads: increment(use.local.queryReads), docReads: increment(use.local.docReads), writes: increment(use.local.writes)},
          cache: {queryReads: increment(use.cache.queryReads), docReads: increment(use.cache.docReads), writes: increment(use.cache.writes)}
        })
        BaseRepository.use = createEmptyUse();
        localStorage.setItem(DB_USE, JSON.stringify(BaseRepository.use));
        saveUse = true;
      }, 10000);
    };

    if (updateUse) {
      updateUse = false;
      setTimeout(() => {
        updateUse = true;
        localStorage.setItem(DB_USE, JSON.stringify(BaseRepository.use));
      }, 1000);
    };
  }

}
