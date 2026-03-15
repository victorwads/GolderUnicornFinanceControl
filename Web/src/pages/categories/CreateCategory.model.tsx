import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { SelectListOption } from "@components/ui/select-list";
import { Category } from "@models";
import getRepositories, { waitUntilReady } from "@repositories";
import {
  CategoryForm,
  CreateCategoryRoute,
  CreateCategoryViewModel,
  ToPreviousRoute,
} from "@layouts/categories/CreateCategory";

function buildCategoryOptions(currentCategoryId?: string): SelectListOption[] {
  return getRepositories()
    .categories
    .getAllRoots()
    .filter((category) => category.id !== currentCategoryId)
    .map((category) => ({
      label: category.name,
      value: category.id,
      iconName: category.icon,
      backgroundColor: category.color,
    }));
}

export function useCreateCategoryModel(): CreateCategoryViewModel {
  const router = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const [categories, setCategories] = useState<SelectListOption[]>([]);

  const { register, handleSubmit, setValue, watch, reset } = useForm<CategoryForm>({
    defaultValues: {
      name: "",
      icon: "folder",
      color: "#3b82f6",
      parentCategory: "",
    },
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      await waitUntilReady("categories");
      if (!active) return;

      const repositories = getRepositories();
      const existingCategory = id ? repositories.categories.getLocalById(id) : undefined;
      const selectedParentCategoryId = searchParams.get("parentCategory") || "";

      setCategories(buildCategoryOptions(id));

      if (!existingCategory) {
        reset({
          name: "",
          icon: "folder",
          color: "#3b82f6",
          parentCategory: selectedParentCategoryId,
        });
        return;
      }

      const parent = existingCategory.parentId
        ? repositories.categories.getLocalById(existingCategory.parentId)
        : undefined;

      reset({
        name: existingCategory.name,
        icon: existingCategory.icon || parent?.icon || "folder",
        color: existingCategory.color || parent?.color || "#3b82f6",
        parentCategory: existingCategory.parentId || "",
      });
    };

    load();

    return () => {
      active = false;
    };
  }, [id, reset, searchParams]);

  async function onSubmit(data: CategoryForm) {
    const name = data.name.trim();
    if (!name) {
      window.alert(Lang.commons.fillAllFields);
      return;
    }

    const current = id ? getRepositories().categories.getLocalById(id) : undefined;
    const nextCategory = new Category(
      current?.id || "",
      name,
      data.icon,
      data.color,
      data.parentCategory || undefined,
    );

    await getRepositories().categories.set(nextCategory);
    router("/categories");
  }

  function navigate(route: CreateCategoryRoute) {
    switch (true) {
      case route instanceof ToPreviousRoute:
        router(-1);
        break;

      default:
        console.warn("Unknown route type", route);
        break;
    }
  }

  return {
    navigate,
    isEdit,
    register,
    handleSubmit,
    setValue,
    watch,
    onSubmit,
    categories,
  };
}
