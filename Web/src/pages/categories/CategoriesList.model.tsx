import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type LucideIcon } from "lucide-react";

import getRepositories, { waitUntilReady } from "@repositories";
import { Category as CategoryModel, RootCategory } from "@models";
import Icon, { getIconByCaseInsensitiveName } from "@components/Icons";
import {
  Category,
  CategoryTreeNode,
  CategoriesListViewModel,
  CategoriesRoute,
  ToCreateCategoryRoute,
  ToEditCategoryRoute,
  ToMoreRoute,
} from "@layouts/categories/CategoriesList";

function makeCategoryIcon(iconName?: string): LucideIcon {
  const CategoryIcon = ({ className }: { className?: string }) => (
    <Icon icon={getIconByCaseInsensitiveName(iconName || "question")} className={className} />
  );

  return CategoryIcon as LucideIcon;
}

function toVisualCategory(category: CategoryModel): Category {
  const repositories = getRepositories();
  const parent = category.parentId ? repositories.categories.getLocalById(category.parentId) : undefined;
  const color = category.color || parent?.color || "#64748b";
  const iconName = category.icon || parent?.icon;

  return {
    id: String(category.id),
    name: category.name,
    icon: makeCategoryIcon(iconName),
    color,
    parentId: category.parentId,
  };
}

function toCategoryTreeNode(category: RootCategory): CategoryTreeNode {
  return {
    ...toVisualCategory(category),
    children: category.children
      .map((child) => toVisualCategory(child))
      .sort((left, right) => left.name.localeCompare(right.name)),
  };
}

function toVisualCategories(): CategoryTreeNode[] {
  return getRepositories()
    .categories
    .getAllRoots()
    .map((category) => toCategoryTreeNode(category))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function useCategoriesListModel(): CategoriesListViewModel {
  const router = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);

  useEffect(() => {
    let active = true;
    let dispose: Array<() => void> = [];

    const sync = () => {
      if (!active) return;
      setCategories(toVisualCategories());
    };

    const load = async () => {
      await waitUntilReady("categories");
      if (!active) return;

      sync();

      const repositories = getRepositories();
      dispose = [
        repositories.categories.addUpdatedEventListenner(sync),
      ];
    };

    load();

    return () => {
      active = false;
      dispose.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  function navigate(route: CategoriesRoute) {
    switch (true) {
      case route instanceof ToMoreRoute:
        router("/settings");
        break;

      case route instanceof ToCreateCategoryRoute:
        router(route.parentCategoryId
          ? `/categories/create?parentCategory=${encodeURIComponent(route.parentCategoryId)}`
          : "/categories/create");
        break;

      case route instanceof ToEditCategoryRoute:
        router(`/categories/${route.categoryId}`);
        break;

      default:
        console.warn("Unknown route type", route);
        break;
    }
  }

  return {
    navigate,
    categories,
    selectedCategoryId: id,
  };
}
