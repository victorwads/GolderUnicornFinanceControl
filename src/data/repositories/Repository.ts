import {
  collection,
  getDocs,
  getDocsFromCache,
  QuerySnapshot,
  DocumentData,
  Query,
  getFirestore,
  Firestore,
  CollectionReference,
  FirestoreDataConverter,
  addDoc,
  DocumentReference,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default abstract class BaseRepository<Model extends DocumentData> {
  private static localCache: { [key: string]: { [key: string]: DocumentData } } = {};
  private static localCacheStates: { [key: string]: Promise<any> } = {};
  private lastUpdateKey: string;

  protected db: Firestore;
  protected ref: CollectionReference<Model>;

  protected abstract cacheDuration: number;

  constructor(
    private collectionName: string,
    firestoreConverter: FirestoreDataConverter<Model>,
    private useLocalCache: boolean = false,
    private useUser: boolean = true
  ) {
    if (this.useUser) {
      this.collectionName = collectionName.replace(/\{userId\}/g, this.getUserId());
    }
    this.lastUpdateKey = `last${collectionName}Update`;
    this.db = getFirestore();
    this.ref = collection(this.db, this.collectionName).withConverter(firestoreConverter);

    if (!BaseRepository.localCache[this.collectionName] && this.useLocalCache) {
      BaseRepository.localCache[this.collectionName] = {};
      BaseRepository.localCacheStates[this.collectionName] = this.getAll();
    }
  }

  public async waitInit(): Promise<void> {
    this.validateCache();
    await BaseRepository.localCacheStates[this.collectionName];
  }

  public async getAll(
    forceCache: boolean = false,
    queryBuilder: (ref: CollectionReference<Model>) => Query<Model> = (ref) => ref,
    onItemDecoded: (model: Model) => void = () => {}
  ): Promise<Model[]> {
    if (this.useLocalCache) {
      await BaseRepository.localCacheStates[this.collectionName];
    }

    console.log("getAll", this.collectionName, forceCache);
    let result: QuerySnapshot<Model>;
    if (forceCache || this.shouldUseCache()) {
      result = await getDocsFromCache(queryBuilder(this.ref));
    } else {
      result = await getDocs(queryBuilder(this.ref));
      this.setLastUpdate();
    }

    const items = result.docs.map((snap) => {
      const item = snap.data();
      onItemDecoded(item);
      if (this.useLocalCache) {
        BaseRepository.localCache[this.collectionName][snap.id] = item;
      }
      return item;
    });

    return items;
  }

  public getLocalById(id?: string): Model | undefined {
    this.validateCache();
    return BaseRepository.localCache[this.collectionName][id ?? ""] as Model;
  }

  public async add(model: Model): Promise<DocumentReference<Model>> {
    const result = await addDoc(this.ref, model);
    (model as any).id = result.id;
    if (this.useLocalCache) {
      BaseRepository.localCache[this.collectionName][model.id] = model;
    }
    return result;
  }

  public getCache(): Model[] {
    this.validateCache();
    return Object.values(BaseRepository.localCache[this.collectionName] || {}) as Model[];
  }

  private shouldUseCache(): boolean {
    const lastUpdate = Number(localStorage.getItem(this.lastUpdateKey));
    return this.cacheDuration > 0 && Date.now() - (lastUpdate || 0) < this.cacheDuration;
  }

  private setLastUpdate(): void {
    localStorage.setItem(this.lastUpdateKey, Date.now().toString());
  }

  private validateCache(): void {
    if (!this.useLocalCache) {
      throw new Error("Local cache is not enabled for this repository");
    }
  }

  private getUserId(custom?: string): string {
    const userId = custom ?? getAuth().currentUser?.uid;
    if (!userId) {
      throw new Error("Invalid userId");
    }
    return userId;
  }
}
