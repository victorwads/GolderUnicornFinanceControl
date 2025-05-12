import RepositoryWithCrypt from './RepositoryWithCrypt';

import Category from "../models/Category";
import InvoiceRegistry from '../models/InvoiceRegistry';
import { Collections } from "../../data/firebase/Collections";

export default class CategoriesRepository extends RepositoryWithCrypt<Category> {

	constructor() {
		super(`${Collections.Users}/{userId}/${Collections.Categories}`, Category);
		this.addToCache(new Category(InvoiceRegistry.categoryId, "Fatura Cartão de Crédito", "creditcard", "#000000"));
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

	public override getLocalById(id?: string): Category | undefined {
		const category = super.getLocalById(id);
		if (!category) return undefined;
		if (!category?.icon && category?.parentId) {
			const root = this.getLocalById(category.parentId);
			if (!root) return category;
			category.color = root.color ?? "#000000";
			category.icon = root.icon ?? "folder";
		}
		return category;
	}
}

export interface RootCategory extends Category {
	children: Category[];
}
