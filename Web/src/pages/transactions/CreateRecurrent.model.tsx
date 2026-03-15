import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

import type { SelectListOption } from "@components/ui/select-list";
import getRepositories, { waitUntilReady } from "@repositories";
import { CreateRecurrentViewModel, RecurrentForm, ToPreviousRoute } from "@layouts/transactions/CreateRecurrent";
import { buildHierarchicalCategoryOptions } from "@pages/categories/categorySelectOptions";

const accounts: SelectListOption[] = [
  { label: "Nubank", value: "nubank", iconName: "piggy-bank", backgroundColor: "#8A05BE" },
  { label: "Inter", value: "inter", iconName: "landmark", backgroundColor: "#FF7A00" },
];

const cards: SelectListOption[] = [
  { label: "Nubank Gold", value: "nubank", iconName: "credit-card", backgroundColor: "#8A05BE" },
  { label: "Inter Black", value: "inter", iconName: "credit-card", backgroundColor: "#FF7A00" },
];

export function useCreateRecurrentModel(): CreateRecurrentViewModel {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const [categories, setCategories] = useState<SelectListOption[]>([]);

  const { register, handleSubmit, setValue, watch, reset } = useForm<RecurrentForm>({
    defaultValues: {
      type: "account",
      amount: 0,
      recurrenceDay: 1,
      tags: [],
    },
  });

  useEffect(() => {
    let active = true;

    const syncCategories = async () => {
      await waitUntilReady("categories");
      if (!active) return;
      setCategories(buildHierarchicalCategoryOptions(getRepositories().categories.getCache()));
    };

    syncCategories();

    const dispose = getRepositories().categories.addUpdatedEventListenner(() => {
      setCategories(buildHierarchicalCategoryOptions(getRepositories().categories.getCache()));
    });

    return () => {
      active = false;
      dispose();
    };
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    reset({
      type: "creditcard",
      accountOrCard: "nubank",
      recurrenceDay: 15,
      amount: 39.9,
      description: "Netflix",
      category: "moradia-contas",
      tags: ["assinatura", "streaming"],
      notes: "Assinatura mensal",
    });
  }, [isEdit, reset]);

  const type = watch("type");
  const recurrenceDay = watch("recurrenceDay");
  const amount = watch("amount");

  function generatePreview() {
    const today = new Date();
    return Array.from({ length: 3 }, (_, index) => (
      new Date(today.getFullYear(), today.getMonth() + index, recurrenceDay)
    ));
  }

  function onSubmit(data: RecurrentForm) {
    console.log(isEdit ? "Recorrência atualizada:" : "Transação recorrente criada:", data);
    navigate("/recurrents");
  }

  return {
    navigate: (route) => {
      if (route instanceof ToPreviousRoute) {
        navigate(-1);
        return;
      }
      navigate("/recurrents");
    },
    isEdit,
    register,
    handleSubmit,
    setValue,
    watch,
    onSubmit,
    type,
    recurrenceDay,
    amount,
    generatePreview,
    accounts,
    categories,
    cards,
  };
}
