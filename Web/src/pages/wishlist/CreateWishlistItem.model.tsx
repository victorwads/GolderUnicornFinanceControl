import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

import type { SelectListOption } from "@components/ui/select-list";
import { WishlistItem } from "@models";
import getRepositories, { waitUntilReady } from "@repositories";
import {
  CreateWishlistItemViewModel,
  ToPreviousRoute,
  WishlistItemForm,
} from "@layouts/wishlist/CreateWishlistItem";
import { buildHierarchicalCategoryOptions } from "@pages/categories/categorySelectOptions";

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateInputValue(value?: string): Date {
  if (!value) return new Date();
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function useCreateWishlistItemModel(): CreateWishlistItemViewModel {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const [categories, setCategories] = useState<SelectListOption[]>([]);

  const { register, handleSubmit, setValue, watch, reset } = useForm<WishlistItemForm>({
    defaultValues: {
      amount: 0,
      targetDate: toDateInputValue(new Date()),
      priority: "medium",
      tags: [],
    },
  });

  useEffect(() => {
    let active = true;
    let dispose: (() => void) | undefined;

    const syncCategories = () => {
      if (!active) return;
      setCategories(buildHierarchicalCategoryOptions(getRepositories().categories.getCache()));
    };

    const load = async () => {
      await waitUntilReady("categories");
      syncCategories();
      dispose = getRepositories().categories.addUpdatedEventListenner(syncCategories);
    };

    load();

    return () => {
      active = false;
      dispose?.();
    };
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;
    let active = true;

    const load = async () => {
      await waitUntilReady("wishlistItems");
      if (!active) return;
      const item = getRepositories().wishlistItems.getLocalById(id);
      if (!item) return;

      reset({
        description: item.description,
        amount: item.value,
        targetDate: toDateInputValue(item.date),
        priority: item.priority || "medium",
        category: item.categoryId || "",
        tags: item.tags || [],
        notes: item.observation || "",
      });
    };

    load();

    return () => {
      active = false;
    };
  }, [id, isEdit, reset]);

  async function onSubmit(data: WishlistItemForm) {
    await waitUntilReady("wishlistItems");
    const repository = getRepositories().wishlistItems;
    const item = new WishlistItem(
      id || "",
      Math.abs(Number(data.amount || 0)),
      data.description || Lang.wishlist.fallbackTitle,
      fromDateInputValue(data.targetDate),
      data.priority,
      data.category || undefined,
      data.notes || undefined,
      data.tags || [],
    );

    await repository.set(item, isEdit);
    navigate("/wishlist");
  }

  return {
    navigate: (route) => {
      if (route instanceof ToPreviousRoute) {
        navigate(-1);
        return;
      }
      navigate("/wishlist");
    },
    isEdit,
    register,
    handleSubmit,
    setValue,
    watch,
    onSubmit,
    categories,
  };
}
