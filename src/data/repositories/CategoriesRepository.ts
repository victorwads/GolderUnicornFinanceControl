import {
	getFirestore,
	collection,
	addDoc,
	CollectionReference,
	DocumentData,
	Firestore,
	getDocs,
	getDocsFromCache,
	QuerySnapshot,
} from "firebase/firestore";
import { Collections } from "../../data/firebase/Collections";
import Category from "../models/Category";
import { getAuth } from "firebase/auth";

interface RootCategory {
	category: Category;
	children: Category[];
}

export default class CategoriesRepository {
	private static lastUpdateKey = 'lastCategoriesUpdate';
	private static cacheDuration = 24 * 60 * 60 * 1000;
	private db: Firestore;
	private ref: CollectionReference<Category, DocumentData>;

	private static rootCategoriesCache: RootCategory[] = [];
	private static categoriesCache: Map<string, Category> = new Map();

	constructor(userId?: string) {
		let finalUserId = userId ?? getAuth().currentUser?.uid ?? ""
		if (finalUserId == "") {
			throw new Error("Invalid userId")
		}
		this.db = getFirestore();
		this.ref = collection(this.db, `${Collections.Users}/${finalUserId}/${Collections.Categories}`)
			.withConverter(Category.firestoreConverter);
	}

	private shouldUseCache() {
		let lastUpdate: string = localStorage.getItem(CategoriesRepository.lastUpdateKey) ?? "0"
		return (Date.now() - parseInt(lastUpdate)) < CategoriesRepository.cacheDuration
	}

	private setLastUpdate() {
		localStorage.setItem(CategoriesRepository.lastUpdateKey, Date.now().toString());
	}

	public addCategory = async (category: Category) => addDoc(this.ref, category);

	public getAll = async (forceSource: null | "server" | "cache" = null): Promise<RootCategory[]> => {
		let querySnapshot: QuerySnapshot<Category>;
		if (forceSource == "cache" || (this.shouldUseCache() && forceSource != 'server')) {
			querySnapshot = await getDocsFromCache(this.ref);
		} else {
			querySnapshot = await getDocs(this.ref);
			this.setLastUpdate()
		}

		let rootCategories: RootCategory[] = [];
		let categories: Map<string, Category> = new Map();

		querySnapshot.forEach((doc) => {
			const category = doc.data();
			categories.set(category.id, category);
			if (!category.parentId) {
				rootCategories.push({
					category: category,
					children: [],
				});
			}
		});

		rootCategories.forEach((root) => {
			categories.forEach((category) => {
				if (category.parentId === root.category.id) {
					category.color = root.category.color;
					category.icon = root.category.icon;
					root.children.push(category);
				}
			});
		});

		CategoriesRepository.categoriesCache = categories;
		CategoriesRepository.rootCategoriesCache = rootCategories;
		return rootCategories;
	};

	public getById = (id: string): Category | undefined =>
		CategoriesRepository.categoriesCache.get(id);
}
