import {
  getFirestore,
  // Types
  Firestore, FirestoreDataConverter,
  Query, QuerySnapshot, CollectionReference,
  QueryDocumentSnapshot, DocumentData, DocumentReference,
  // Actions
  addDoc, getDocsFromCache, getDocsFromServer, setDoc,
  collection, doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { EncryptorSingletone } from "../crypt/Encryptor";

export default abstract class BaseRepository<Model extends DocumentData> {
  private static localCache: { [key: string]: { [key: string]: DocumentData } } = {};
  private static localCacheStates: { [key: string]: Promise<any> } = {};
  private lastUpdateKey: string;

  protected db: Firestore;
  protected ref: CollectionReference<any>;
  protected converter: FirestoreDataConverter<Model>;

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
    this.ref = collection(this.db, this.collectionName);
    this.converter = firestoreConverter;

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
    let result: QuerySnapshot<Model>;
    if (forceCache || this.shouldUseCache()) {
      result = await getDocsFromCache(queryBuilder(this.ref));
    } else {
      result = await getDocsFromServer(queryBuilder(this.ref));
      this.setLastUpdate();
    }

    const items = result.docs.map(async (snap) => {
      let item = await this.handleSnapDecryption(snap);
      onItemDecoded(item);

      if (this.useLocalCache) {
        BaseRepository.localCache[this.collectionName][snap.id] = item;
      }
      return item;
    });

    return Promise.all(items);
  }

  public getLocalById(id?: string): Model | undefined {
    this.validateCache();
    return BaseRepository.localCache[this.collectionName][id ?? ""] as Model;
  }

  public async set(model: Model, id?: string): Promise<DocumentReference<Model>> {
    let data = await this.handleSnapEncryption(model);
    let result;
    if(id) {
      result = doc(this.ref, id);
      console.log("encrypted data", result.path, data);
      // await setDoc(result, data);
    } else {
      result = await addDoc(this.ref, data);
    }
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
    return false;
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

  private async handleSnapDecryption(snap: QueryDocumentSnapshot<Model, DocumentData>): Promise<Model> {
    let data = snap.data();
    if (data.encrypted) {
      data = await EncryptorSingletone.decrypt(data);
      snap.data = () => data;
    }
    data = this.converter.fromFirestore(snap);

    if(!data.encrypted && this.collectionName.includes('Categories')) {
      this.set(data, snap.id);
    }
    return data;
  }

  private async handleSnapEncryption(model: Model): Promise<DocumentData> {
    return await EncryptorSingletone.encrypt(
      this.converter.toFirestore(model)
    );
  }
}
