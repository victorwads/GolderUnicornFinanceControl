import { collection, getDocs, getDocsFromCache, QuerySnapshot, DocumentData, Query, getFirestore, Firestore, CollectionReference, FirestoreDataConverter, addDoc, DocumentReference } from "firebase/firestore";

export default abstract class BaseRepository<Model extends DocumentData> {

    private static localCacheStates: { [key: string]: Promise<any> } = {};
    private static localCache: {
        [key: string]: { [key: string]: DocumentData; }
    } = {};
    private lastUpdateKey: string;
    protected abstract cacheDuration: number;

    protected db: Firestore;
    protected ref: CollectionReference<Model, DocumentData>;

    constructor(
        private collectionName: string,
        firestoreConverter: FirestoreDataConverter<Model>,
        private useLocalCache: boolean = false
    ) {
        this.lastUpdateKey = `last${collectionName}Update`;
        this.db = getFirestore();
        this.ref = collection(this.db, this.collectionName)
            .withConverter(firestoreConverter);

        if (!BaseRepository.localCache[this.collectionName] && this.useLocalCache) {
            BaseRepository.localCache[this.collectionName] = {};
            BaseRepository.localCacheStates[this.collectionName] = this.getItems();
            console.log("Repository inited: ", this.collectionName);
        }
        console.log("Repository: ref", this.collectionName);
    }

    public async waitInit(): Promise<any> {
        await BaseRepository.localCacheStates[this.collectionName];
    }

    public async getItems(
        forceCache: boolean = false,
        queryBuilder: (ref: CollectionReference<Model, DocumentData>) => Query<Model, DocumentData>
            = (ref) => ref,
        onItemDecoded: (model: Model) => void = () => { }
    ): Promise<Model[]> {
        let result: QuerySnapshot<Model, DocumentData>;
        if (forceCache || this.shouldUseCache()) {
            result = await getDocsFromCache(queryBuilder(this.ref));
            console.log("BaseRepository: getDocsFromCache", this.ref.path);
        } else {
            result = await getDocs(queryBuilder(this.ref));
            console.log("BaseRepository: getDocs", this.ref.path);
            this.setLastUpdate();
        }
        let items = result.docs.map(snap => {
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
        return BaseRepository.localCache[this.collectionName][id ?? ""] as Model;
    }

    public async add(model: Model): Promise<DocumentReference<Model>> {
        const result = await addDoc(this.ref, model);
        (model as any).id = result.id;
        BaseRepository.localCache[this.collectionName][model.id] = model;
        return result;
    }

    protected getCache(): Model[] {
        return Object.values(BaseRepository.localCache[this.collectionName] || {}) as Model[];
    }

    private shouldUseCache(): boolean {
        return false;
        const lastUpdate = Number(localStorage.getItem(this.lastUpdateKey));
        return (this.cacheDuration > 0) && (Date.now() - (lastUpdate || 0)) < this.cacheDuration;
    }

    private setLastUpdate(): void {
        localStorage.setItem(this.lastUpdateKey, Date.now().toString());
    }
}