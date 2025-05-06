import BaseRepository from "./Repository";

import Category from "../models/Category";
import { Collections } from "../../data/firebase/Collections";

export default class CategoriesRepository extends BaseRepository<Category> {

	constructor() {
		super(`${Collections.Users}/{userId}/${Collections.Categories}`, Category.firestoreConverter, true);
	}

	public getAllRoots = async (): Promise<RootCategory[]> => {
		let rootCategories: RootCategory[] = [];
		let categories: Map<string, Category> = new Map();

		(await this.getAll()).forEach((category) => {
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

		return rootCategories;
	};
}

interface RootCategory {
	category: Category;
	children: Category[];
}
