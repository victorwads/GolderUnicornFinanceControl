import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { SelectListOption } from "@components/ui/select-list";
import {
  AddCreditCardTransactionRoute,
  AddCreditCardTransactionViewModel,
  CreditCardTransactionForm,
  InstallmentPreview,
  ToPreviousRoute,
} from "@layouts/credit-cards/AddCreditCardTransaction";
import { CreditCardRegistry } from "@models";
import { buildHierarchicalCategoryOptions } from "@pages/categories/categorySelectOptions";
import getRepositories, { waitUntilReady } from "@repositories";

function toInvoiceMonthValue(month: number, year: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function buildDefaultInvoiceMonth() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
}

function buildCardOptions(): SelectListOption[] {
  return getRepositories()
    .creditCards
    .getCacheWithBank()
    .map((card) => ({
      label: card.name,
      value: card.id,
      iconUrl: card.bank.logoUrl,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function useAddCreditCardTransactionModel(): AddCreditCardTransactionViewModel {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;

  const [cards, setCards] = useState<SelectListOption[]>([]);
  const [categories, setCategories] = useState<SelectListOption[]>([]);
  const [registry, setRegistry] = useState<CreditCardRegistry | null>(null);

  const { register, handleSubmit, setValue, watch, reset } = useForm<CreditCardTransactionForm>({
    defaultValues: {
      card: "",
      invoiceMonth: buildDefaultInvoiceMonth(),
      amount: 0,
      description: "",
      category: "",
      tags: [],
      notes: "",
      isInstallment: false,
      installments: 1,
    },
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      await waitUntilReady("creditCards", "creditCardsTransactions", "categories");
      if (!active) return;

      const repositories = getRepositories();
      const availableCards = buildCardOptions();
      const availableCategories = buildHierarchicalCategoryOptions(repositories.categories.getCache());
      const currentRegistry = id ? repositories.creditCardsTransactions.getLocalById(id) ?? null : null;

      setCards(availableCards);
      setCategories(availableCategories);
      setRegistry(currentRegistry);

      if (currentRegistry) {
        reset({
          card: currentRegistry.cardId,
          invoiceMonth: toInvoiceMonthValue(currentRegistry.month, currentRegistry.year),
          amount: currentRegistry.value,
          description: currentRegistry.description,
          category: currentRegistry.categoryId || "",
          tags: currentRegistry.tags || [],
          notes: currentRegistry.observation || "",
          isInstallment: false,
          installments: 1,
        });
        return;
      }

      const cardFromQuery = searchParams.get("card");
      const nextCardId = cardFromQuery || availableCards[0]?.value || "";
      if (nextCardId) {
        setValue("card", nextCardId);
      }

      const categoryFromQuery = searchParams.get("category");
      if (categoryFromQuery) {
        setValue("category", categoryFromQuery);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [id, reset, searchParams, setValue]);

  const amount = watch("amount");
  const installments = watch("installments");
  const isInstallment = watch("isInstallment");
  const invoiceMonth = watch("invoiceMonth");

  const installmentValue = installments > 1 ? amount / installments : amount;

  const installmentPreviews = useMemo(() => {
    if (!isInstallment || installments < 2 || !amount || !invoiceMonth) return [];

    const [year, month] = invoiceMonth.split("-").map(Number);
    const previews: InstallmentPreview[] = [];

    for (let index = 0; index < installments; index++) {
      const date = new Date(year, month - 1 + index, 1);
      const previewMonth = String(date.getMonth() + 1).padStart(2, "0");
      const previewYear = date.getFullYear();

      previews.push({
        id: index,
        date: `${previewMonth}/${previewYear}`,
        monthYear: `${previewYear}-${previewMonth}`,
        installmentNumber: index + 1,
        isPaid: index === 0,
      });
    }

    return previews;
  }, [amount, installments, invoiceMonth, isInstallment]);

  async function onSubmit(data: CreditCardTransactionForm) {
    if (!data.card || !data.description.trim() || !data.amount) {
      window.alert(Lang.commons.fillAllFields);
      return;
    }

    const [year, month] = data.invoiceMonth.split("-").map(Number);
    const nextRegistry = new CreditCardRegistry(
      registry?.id || "",
      data.card,
      month,
      year,
      registry?.date || new Date(),
      data.description.trim(),
      data.amount,
      data.tags || [],
      data.category || undefined,
      data.notes || undefined,
      registry?.relatedInfo
    );

    await getRepositories().creditCardsTransactions.set(nextRegistry);
    navigate(-1);
  }

  function onNavigate(route: AddCreditCardTransactionRoute) {
    switch (true) {
      case route instanceof ToPreviousRoute:
        navigate(-1);
        break;

      default:
        console.warn("Unknown route type", route);
        break;
    }
  }

  return {
    navigate: onNavigate,
    isEdit,
    register,
    handleSubmit,
    setValue,
    watch,
    onSubmit,
    cards,
    categories,
    installmentValue,
    installmentPreviews,
  };
}
