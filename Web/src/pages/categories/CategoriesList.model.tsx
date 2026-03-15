import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, type LucideIcon } from "lucide-react";

import getRepositories, { waitUntilReady } from "@repositories";
import { Category as CategoryModel } from "@models";
import Icon, { getIconByCaseInsensitiveName } from "@components/Icons";
import {
  Category,
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

function buildTransactionCountByCategoryId() {
  const repositories = getRepositories();
  const counts = new Map<string, number>();
  const allTransactions = [
    ...repositories.accountTransactions.getCache(),
    ...repositories.creditCardsTransactions.getCache(),
    ...repositories.creditCardsInvoices.getCache().map((invoice) => ({
      categoryId: invoice.categoryId,
    })),
  ];

  allTransactions.forEach((transaction) => {
    if (!transaction.categoryId) return;
    counts.set(transaction.categoryId, (counts.get(transaction.categoryId) || 0) + 1);
  });

  return counts;
}

function toVisualCategories(categories: CategoryModel[]): Category[] {
  const repositories = getRepositories();
  const transactionCountByCategoryId = buildTransactionCountByCategoryId();

  return categories.map((category) => {
    const parent = category.parentId ? repositories.categories.getLocalById(category.parentId) : undefined;
    const color = category.color || parent?.color || "#64748b";
    const iconName = category.icon || parent?.icon;

    return {
      id: category.id as unknown as number,
      name: parent ? `${parent.name} / ${category.name}` : category.name,
      icon: makeCategoryIcon(iconName),
      color,
      transactionCount: transactionCountByCategoryId.get(category.id) || 0,
    };
  }).sort((left, right) => left.name.localeCompare(right.name));
}

export function useCategoriesListModel(): CategoriesListViewModel {
  const router = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let active = true;
    let dispose: Array<() => void> = [];

    const sync = () => {
      if (!active) return;
      const repositories = getRepositories();
      setCategories(toVisualCategories(repositories.categories.getCache()));
    };

    const load = async () => {
      await waitUntilReady("categories", "accountTransactions", "creditCardsTransactions", "creditCardsInvoices");
      if (!active) return;

      sync();

      const repositories = getRepositories();
      dispose = [
        repositories.categories.addUpdatedEventListenner(sync),
        repositories.accountTransactions.addUpdatedEventListenner(sync),
        repositories.creditCardsTransactions.addUpdatedEventListenner(sync),
        repositories.creditCardsInvoices.addUpdatedEventListenner(sync),
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
        router("/categories/create");
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
  };
}
