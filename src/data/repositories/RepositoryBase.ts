import {
  getFirestore,
  // Types
  Firestore,
  CollectionReference, Query, Timestamp,
  DocumentData, DocumentReference,
  // Actions
  addDoc, getDocsFromCache, getDocs, setDoc, writeBatch,
  collection, doc, query, orderBy, limit, where,
} from "firebase/firestore";

import { DocumentModel } from "@models";
import {
  incrementUseValues,
  ResourceUseNode,
  DatabasesUse,
  createEmptyUse,
  sumValues,
  AIUse,
} from "./useUtils";

const queryField: keyof DocumentModel = "_updatedAt";
const DB_USE = "dbUse";;
const SAVED_CACHE = localStorage.getItem(DB_USE);
let updateUse = true; let saveUse = true;

export default abstract class BaseRepository<Model extends DocumentModel> {
  protected db: Firestore;
  protected ref: CollectionReference<any>;
  protected collectionName: string;
  protected userId?: string;
  private minimumCacheSize = 0;
  private inited: boolean = false;

  constructor(
    private collectionNamePattern: string,
    private modelClass: new (...args: any) => Model
  ) {
    this.collectionName = this.parseCollectionName();
    this.db = getFirestore();
    this.ref = collection(this.db, this.collectionName);
  }

  protected getSafeUserId(): string {
    const userId = this.userId;
    if (!userId) throw new Error('User not authenticated');
    return userId;
  }

  public async waitInit(): Promise<void> {
    if (Object.keys(BaseRepository.cache[this.collectionName] || {}).length === this.minimumCacheSize) {
      await this.getAll();
      const length = Object.keys(BaseRepository.cache[this.collectionName]).length;
      console.log(`Cache for ${this.collectionName} initialized with ${length} items`);
    }
  }

  public async reset(userId?: string) {
    this.userId = userId;
    this.collectionName = this.parseCollectionName();
    this.ref = collection(this.db, this.collectionName);
    if (!BaseRepository.cache[this.collectionName]) {
      BaseRepository.cache[this.collectionName] = {};
    }
    await this.waitInit();
  }

  protected async createQuery(field: Partial<Model>): Promise<Query<Model, DocumentData>> {
    const queries = Object.entries(field).map(([key, value]) =>
      Array.isArray(value) ? where(key, "in", value) : where(key, "==", value)
    );
    if (queries.length === 0) {
      return this.ref;
    }

    return query(this.ref, ...queries);
  }

  public async getAll(fieldsFilter?: Partial<Model>): Promise<Model[]> {
    await this.updateLocalCache();

    const queryResult = await getDocsFromCache(
      fieldsFilter ? await this.createQuery(fieldsFilter) : this.ref
    );
    BaseRepository.addUse({
      db: {
        local: { queryReads: 1, docReads: queryResult.docs.length },
        cache: { writes: queryResult.docs.length }
      }
    });

    const items = [];
    for (const snap of queryResult.docs) {
      let item = await this.fromFirestore(snap.id, snap.data());
      BaseRepository.cache[this.collectionName][snap.id] = item;
      items.push(item);
    };
    this.postQueryProcess(items);

    return items;
  }

  protected addToCache(model: Model): void {
    this.minimumCacheSize++;
    BaseRepository.cache[this.collectionName][model.id] = model;
    BaseRepository.addUse({
      db: { cache: { writes: 1 } }
    });    
  }

  public getLocalById(id?: string): Model | undefined {
    BaseRepository.addUse({
      db: { cache: { docReads: 1 } }
    });

    return BaseRepository.cache[this.collectionName][id ?? ""] as Model;
  }

  public async set(model: Model, merge: boolean = false, update: boolean = true): Promise<DocumentReference<Model>> {
    let data = await this.toFirestore(model);
    let result;
    if (update) await this.updateLocalCache();
    if (model.id && model.id !== "") {
      result = doc(this.ref, model.id);
      await setDoc(result, data, { merge })
        .catch(this.getErrorHanlder("setting", model, data));
    } else {
      result = await addDoc(this.ref, data)
        .catch(this.getErrorHanlder("adding", model, data));
      (model as any).id = result.id;
    }

    BaseRepository.cache[this.collectionName][model.id] = model;
    BaseRepository.addUse({
      db: {
        remote: { writes: 1 },
        local: { writes: 1 },
        cache: { writes: 1 }
      }
    });
    return result;
  }

  public async saveAll(models: Model[]): Promise<void> {
    if (models.length === 0) return;

    const batch = writeBatch(this.db);
    for (const model of models) {
      const data = await this.toFirestore(model);
      batch.set(doc(this.ref, model.id), data);
      BaseRepository.cache[this.collectionName][model.id] = model;
    }

    await batch.commit();
    BaseRepository.addUse({
      db: {
        remote: { writes: models.length },
        local: { writes: models.length },
        cache: { writes: models.length }
      }
    });
  }

  public getCache(): Model[] {
    const result = Object.values(BaseRepository.cache[this.collectionName] || {}) as Model[];

    BaseRepository.addUse({
      db: { cache: { queryReads: 1, docReads: result.length } }
    });
    return result;
  }

  protected async getLastUpdatedValue(): Promise<any> {
    const queryResult = await getDocsFromCache(query(this.ref, orderBy(queryField, "desc"), limit(1)));
    BaseRepository.addUse({
      db: { local: { queryReads: 1, docReads: queryResult.docs.length } }
    });
    return queryResult.docs[0]?.data()[queryField];
  }

  protected postQueryProcess(items: Model[]): void { }

  protected async fromFirestore(id: string, data: DocumentData): Promise<Model> {
    function findAndReplaceTimestamps(obj: any): any {
      if (Array.isArray(obj)) return obj.map(findAndReplaceTimestamps);
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
    return this.removeUndefined(data);
  }

  protected removeUndefined<T>(obj: T): T {
    if (Array.isArray(obj)) {
      return obj
        .map(item => this.removeUndefined(item))
        .filter(item => item !== undefined) as T;
    }
    if (obj !== null && typeof obj === 'object') {
      if (obj.constructor !== Object) return obj;
      return Object.entries(obj).reduce((acc, [key, value]) => {
        const cleaned = this.removeUndefined(value);
        if (cleaned !== undefined) {
          (acc as any)[key] = cleaned;
        }
        return acc;
      }, {}) as T;
    }
    return obj;
  }

  private async updateLocalCache(): Promise<void> {
    const lastUpdated = await this.getLastUpdatedValue();
    let queryResult;
    if (lastUpdated) {
      queryResult = getDocs(query(this.ref, where(queryField, ">", lastUpdated)));
    } else {
      queryResult = getDocs(this.ref)
        .then((snap) => {
          const ids = snap.docs.map((doc) => doc.id);
          this.getCache().forEach((item) => {
            if (!ids.includes(item.id)) {
              delete BaseRepository.cache[this.collectionName][item.id];
            }
          });
          return snap;
        });
    }
    if (!this.inited) {
      await queryResult
      this.inited = true;
    }
    queryResult
      .then((snap) => {
        BaseRepository.addUse({
          db: { remote: { queryReads: 1, docReads: snap.docs.length } }
        });
      })
      .catch(this.getErrorHanlder("listing"));
  }

  private parseCollectionName(): string {
    const { collectionNamePattern } = this;
    if (!collectionNamePattern.includes("{userId}")) return collectionNamePattern;

    return collectionNamePattern.replace(/\{userId\}/g, this.userId || "nouser");
  }

  private static cache: { [key: string]: { [key: string]: DocumentData } } = {};
  private static use: DatabasesUse = SAVED_CACHE ? JSON.parse(SAVED_CACHE) : createEmptyUse();

  public static getDatabaseUse(): DatabasesUse {
    return BaseRepository.use;
  }

  public static updateUserUse = async (data: DocumentData) => { };

  public static async addUse(additions: DatabasesUse) {
    const use = BaseRepository.use;
    sumValues(use, additions, false);

    console.log('Database use updated:', use);
    if (saveUse && (
      use.db?.remote?.writes ||
      (use.db?.remote?.docReads ?? 0) > 20 ||
      Object.entries(use).some(([, value]) => {
        return ((value as AIUse)?.requests || 0) > 1
      })
    )) {
      saveUse = false;
      setTimeout(async () => {
        saveUse = true;

        console.log('Database use saving:', use);
        sumValues(BaseRepository.use, { remote: { writes: 1 } }, false);
        await BaseRepository.updateUserUse(incrementUseValues(use));
        BaseRepository.use = {};
        localStorage.setItem(DB_USE, JSON.stringify(BaseRepository.use));
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

  protected getErrorHanlder(name: 'adding' | 'listing' | 'setting', ...args: any[]) {
    return (e: Error) => {
      console.error(`Error ${name} document: `, e, ...args, this);
      throw e;
    };
  }
}
