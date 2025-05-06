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

    const encryptedItems = result.docs.map(snap => ({id: snap.id, data: snap.data()}));
    const items = [];
    for(const snap of encryptedItems) {
      let item = await this.handleSnapDecryption(snap.id, snap.data);
      if (this.useLocalCache) {
        BaseRepository.localCache[this.collectionName][snap.id] = item;
      }
      onItemDecoded(item);
      items.push(item);
    };
    return items;
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
      await setDoc(result, data);
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

  private async handleSnapDecryption(id: string, data: any): Promise<Model> {
    if (data.encrypted === true) {
      const newData = await EncryptorSingletone.decrypt(data);
      return this.converter.fromFirestore({ id, data: () => newData} as any);
    }
    const model = this.converter.fromFirestore({ id, data: () => data} as any);
    if(this.collectionName.includes('Account')) { // TOD REMOVE
      this.set(model, id);
    }

    return model;
  }

  private async handleSnapEncryption(model: Model): Promise<DocumentData> {
    const data = this.converter.toFirestore(model);
    return await EncryptorSingletone.encrypt(data);
  }
}
