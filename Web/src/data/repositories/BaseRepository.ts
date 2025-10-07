import {
  getFirestore,
  // Types
  Firestore,
  CollectionReference, Query, Timestamp,
  DocumentData, DocumentReference,
  // Actions
  addDoc, getDocsFromCache, getDocs, setDoc, writeBatch, getDoc,
  collection, doc, query, orderBy, limit, where,
  onSnapshot,
} from "firebase/firestore";

import { DocumentModel } from "@models";
import { addResourceUse } from "./ResourcesUseRepositoryShared";

const queryField: keyof DocumentModel = "_updatedAt";

export default abstract class BaseRepository<Model extends DocumentModel> {
  protected db: Firestore;
  protected ref: CollectionReference<any>;
  protected collectionName: string;
  protected userId?: string;
  private minimumCacheSize = 0;
  private waitRef: Promise<any> | null = null;
  private inited: boolean = false;
  private listenners: ((repository: this) => void)[] = [];
  protected waitFinished: boolean = false;
  private unsubscribeSnapshot?: () => void;

  constructor(
    private collectionNamePattern: string,
    private modelClass: new (...args: any) => Model
  ) {
    this.collectionName = this.parseCollectionName();
    this.db = getFirestore();
    this.ref = collection(this.db, this.collectionName);
  }

  public addUpdatedEventListenner(listenner: (repository: this) => void) {
    this.listenners.push(listenner);
    if (this.listenners.length === 1) {
      this.unsubscribeSnapshot = this.registerCollectionSnapshotListener();
    }
    listenner(this);
    return () => this.removeUpdatedEventListenner(listenner);
  }

  public removeUpdatedEventListenner(listenner: (repository: this) => void) {
    this.listenners = this.listenners.filter(l => l !== listenner);
    if (this.listenners.length === 0 && this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = undefined;
    }
  }

  private callEventListenners() {
    this.listenners.forEach(l => {
      try {
        l(this);
      } catch {}
    });
  }

  protected get safeUserId(): string {
    const userId = this.userId;
    if (!userId) throw new Error('User not authenticated');
    return userId;
  }

  public get isReady(): boolean {
    return this.waitFinished;
  }

  public async waitUntilReady(): Promise<void> {
    if (!this.waitRef) await this.waitInit();
    else await this.waitRef;
  }

  private async handleWait<T>(promisse: Promise<T>): Promise<T> {
    this.waitRef = promisse;
    this.waitFinished = false;
    await promisse;
    this.waitFinished = true;
    return promisse;
  }

  protected async waitInit(): Promise<void> {
    if (Object.keys(this.cache || {}).length === this.minimumCacheSize) {
      await this.handleWait(this.getAll());
      console.warn(`Repository ${this.collectionName} initialized with ${Object.keys(this.cache).length} items`, this.cache);
    }
  }

  public async reset(userId?: string) {
    this.userId = userId;
    this.waitFinished = false;
    this.collectionName = this.parseCollectionName();
    this.ref = collection(this.db, this.collectionName);
    if (!this.cache) {
      this.cache = {};
    }
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
    addResourceUse({
      db: {
        local: { queryReads: 1, docReads: queryResult.docs.length },
      }
    });

    const items = [];
    for (const snap of queryResult.docs) {
      let item = await this.fromFirestore(snap.id, snap.data());
      this.addToCache(item);
      items.push(item);
    };
    this.postQueryProcess(items);

    return items.filter(item => !item.isDeleted);
  }

  protected addToCache(model: Model): void {
    if (!this.cache[model.id]) this.minimumCacheSize++;
    this.cache[model.id] = model;
  }

  public getLocalById(id?: string): Model | undefined {
    return this.cache[id ?? ""] as Model;
  }

  public async delete(id: string): Promise<void> {
    await setDoc(
      doc(this.ref, id),
      { _deletedAt: new Date() }, { merge: true }
    )
    delete this.cache[id];
    this.callEventListenners();
  }

  public async set(model: Model|DocumentData, merge: boolean = false, update: boolean = true): Promise<DocumentReference<Model>> {
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

    if (model instanceof this.modelClass)
      this.addToCache(model);
    else
      await getDoc(doc(this.ref, model.id))
        .then(snap => {
          if (snap.exists()) return this.fromFirestore(snap.id, snap.data());
        })
        .then(m => { if (m) this.addToCache(m); });

    addResourceUse({
      db: {
        remote: { writes: 1, docReads: model instanceof this.modelClass ? 0 : 1 },
        local: { writes: 1 },
      }
    });

    this.callEventListenners();
    return result;
  }

  public async saveAll(models: Model[]): Promise<void> {
    if (models.length === 0) return;

    const batch = writeBatch(this.db);
    for (const model of models) {
      const data = await this.toFirestore(model);
      batch.set(doc(this.ref, model.id), data);
      this.addToCache(model);
    }

    await batch.commit();
    addResourceUse({
      db: {
        remote: { writes: models.length },
        local: { writes: models.length },
      }
    });
    this.callEventListenners();
  }

  public getCache(showDeleted: boolean = false): Model[] {
    const result = Object.values(this.cache || {}) as Model[];
    return result.filter(item => showDeleted || !item.isDeleted);
  }

  protected async getLastUpdatedValue(): Promise<any> {
    const queryResult = await getDocsFromCache(query(this.ref, orderBy(queryField, "desc"), limit(1)));
    addResourceUse({
      db: { local: { queryReads: 1, docReads: queryResult.docs.length } },
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

  protected async toFirestore(model: Model|DocumentData): Promise<DocumentData> {
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
        // TODO: Remove it. everything needs to have soft deletes
        .then((snap) => {
          const ids = snap.docs.map((doc) => doc.id);
          this.getCache().forEach((item) => {
            if (!ids.includes(item.id)) {
              delete this.cache[item.id];
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
        addResourceUse({
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

  private cache: { [key: string]: DocumentData } = {};

  protected getErrorHanlder(name: 'adding' | 'listing' | 'setting', ...args: any[]) {
    return (e: Error) => {
      console.error(`Error ${name} document: `, e, ...args, this);
      throw e;
    };
  }

  private registerCollectionSnapshotListener(): () => void {
    const unsubscribe = onSnapshot(this.ref, (snapshot: any) => {
      const docs = snapshot.docs || [];
      docs.forEach((docSnap: any) => {
        this.fromFirestore(docSnap.id, docSnap.data()).then((model) => {
          this.addToCache(model);
        });
      });
      this.callEventListenners();
    });
    return unsubscribe;
  }
}
