import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import getRepositories, { waitUntilReady } from "@repositories";
import type { WishlistItem } from "@models";
import {
  ToCreateWishlistItemRoute,
  ToEditWishlistItemRoute,
  ToHomeRoute,
  WishlistListItem,
  WishlistListViewModel,
  WishlistRoute,
  WishlistSortMode,
} from "@layouts/wishlist/WishlistList";

const priorityWeight: Record<WishlistItem["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function normalizePriority(priority?: WishlistItem["priority"]): WishlistItem["priority"] {
  return priority || "medium";
}

function getPriorityLabel(priority: WishlistItem["priority"]): string {
  return Lang.wishlist.priority[priority];
}

function toDateLabel(date: Date): string {
  return date.toLocaleDateString(CurrentLangInfo.short);
}

function toVisualItems(): WishlistListItem[] {
  const repositories = getRepositories();

  return repositories.wishlistItems.getCache().map((item) => {
    const category = item.categoryId ? repositories.categories.getLocalById(item.categoryId) : undefined;

    const priority = normalizePriority(item.priority);

    return {
      id: String(item.id),
      title: item.description,
      amount: item.value,
      category: category?.name || Lang.categories.title,
      targetDate: toDateLabel(item.date),
      targetDateTime: item.date.getTime(),
      priority,
      priorityLabel: getPriorityLabel(priority),
      tags: item.tags || [],
      categoryIconName: category?.icon,
      categoryColor: category?.color,
      observation: item.observation,
    };
  });
}

function sortItems(items: WishlistListItem[], mode: WishlistSortMode): WishlistListItem[] {
  return [...items].sort((left, right) => {
    if (mode === "priority") {
      const priorityDiff = priorityWeight[left.priority] - priorityWeight[right.priority];
      if (priorityDiff !== 0) return priorityDiff;
    }

    if (mode === "value") {
      const valueDiff = right.amount - left.amount;
      if (valueDiff !== 0) return valueDiff;
    }

    if (mode === "targetDate") {
      const dateDiff = left.targetDateTime - right.targetDateTime;
      if (dateDiff !== 0) return dateDiff;
    }

    return left.title.localeCompare(right.title);
  });
}

export function useWishlistListModel(): WishlistListViewModel {
  const router = useNavigate();
  const [items, setItems] = useState<WishlistListItem[]>([]);
  const [sortMode, setSortMode] = useState<WishlistSortMode>("priority");

  useEffect(() => {
    let active = true;
    let dispose: (() => void) | undefined;

    const sync = () => {
      if (!active) return;
      setItems(toVisualItems());
    };

    const load = async () => {
      await waitUntilReady("wishlistItems", "categories");
      if (!active) return;

      sync();
      dispose = getRepositories().wishlistItems.addUpdatedEventListenner(sync);
    };

    load();

    return () => {
      active = false;
      dispose?.();
    };
  }, []);

  function navigate(route: WishlistRoute) {
    switch (true) {
      case route instanceof ToHomeRoute:
        router("/");
        break;

      case route instanceof ToCreateWishlistItemRoute:
        router("/wishlist/create");
        break;

      case route instanceof ToEditWishlistItemRoute:
        router(`/wishlist/${route.itemId}`);
        break;

      default:
        console.warn("Unknown route type", route);
        break;
    }
  }

  return {
    navigate,
    items: useMemo(() => sortItems(items, sortMode), [items, sortMode]),
    sortMode,
    setSortMode,
  };
}
