import BaseRepository from "./Repository";

import Category from "../models/Category";
import { Collections } from "../../data/firebase/Collections";

export default class CategoriesRepository extends BaseRepository<Category> {

	constructor() {
		super(`${Collections.Users}/{userId}/${Collections.Categories}`, Category.firestoreConverter, true);
	}

	public getAllRoots = async (): Promise<RootCategory[]> => {
		await this.waitInit();
		let rootCategories: RootCategory[] = [];
		let categories: Map<string, Category> = new Map();

		this.getCache().forEach((category) => {
			categories.set(category.id, category);
			if (!category.parentId) {
				rootCategories.push({
					...category,
					children: [],
				});
			}
		});

		rootCategories.forEach((root) => {
			categories.forEach((category) => {
				if (category.parentId === root.id) {
					category.color = root.color;
					category.icon = root.icon;
					root.children.push(category);
				}
			});
		});

		return rootCategories;
	};
}

export interface RootCategory extends Category {
	children: Category[];
}
