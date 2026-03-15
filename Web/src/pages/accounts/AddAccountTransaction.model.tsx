import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { SelectListOption } from "@components/ui/select-list";
import { AccountTransactionForm, AccountTransactionRoute, AccountTransactionViewModel, ToPreviousRoute } from "@layouts/accounts/AddAccountTransaction";
import getRepositories, { waitUntilReady } from "@repositories";
import { AccountsRegistry, Category, RegistryType } from "@models";

function toDateInputValue(date: Date): string {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60_000)).toISOString().slice(0, 10);
}

function buildCategoryOptions(categories: Category[]): SelectListOption[] {
  const roots = categories.filter((category) => !category.parentId);

  return roots.map((root) => ({
    label: root.name,
    value: root.id,
    iconName: root.icon,
    backgroundColor: root.color,
    subOptions: categories
      .filter((category) => category.parentId === root.id)
      .map((child) => ({
        label: child.name,
        value: child.id,
        iconName: child.icon || root.icon,
        backgroundColor: child.color || root.color,
      })),
  }));
}

export function useAccountTransactionModel(): AccountTransactionViewModel {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();

  const isExplicitIncomeRoute = location.pathname.includes("/income/");
  const [registry, setRegistry] = useState<AccountsRegistry | null>(null);
  const [accounts, setAccounts] = useState<SelectListOption[]>([]);
  const [categories, setCategories] = useState<SelectListOption[]>([]);

  const { register, handleSubmit, setValue, watch, reset } = useForm<AccountTransactionForm>({
    defaultValues: {
      account: "",
      amount: 0,
      description: "",
      date: toDateInputValue(new Date()),
      category: "",
      tags: [],
      notes: "",
      isPaid: false,
    },
  });

  useEffect(() => {
    let active = true;

    const sync = async () => {
      await waitUntilReady("accounts", "banks", "categories", "accountTransactions");
      if (!active) return;

      const repositories = getRepositories();
      const availableAccounts = repositories.accounts.getCacheWithBank(true).map<SelectListOption>((account) => ({
        label: account.name,
        value: account.id,
        iconUrl: account.bank.logoUrl,
        backgroundColor: account.color,
      }));

      const availableCategories = buildCategoryOptions(repositories.categories.getCache());

      setAccounts(availableAccounts);
      setCategories(availableCategories);

      if (!id) {
        if (availableAccounts[0]) {
          setValue("account", watch("account") || availableAccounts[0].value);
        }
        return;
      }

      const existingRegistry = repositories.accountTransactions.getLocalById(id) ?? null;
      setRegistry(existingRegistry);

      if (existingRegistry) {
        reset({
          account: existingRegistry.accountId,
          amount: Math.abs(existingRegistry.value),
          description: existingRegistry.description,
          date: toDateInputValue(existingRegistry.date),
          category: existingRegistry.categoryId || "",
          tags: existingRegistry.tags || [],
          notes: existingRegistry.observation || "",
          isPaid: existingRegistry.paid,
        });
      }
    };

    sync();

    return () => {
      active = false;
    };
  }, [id, reset, setValue, watch]);

  const isEdit = !!id;
  const isIncome = useMemo(() => {
    if (registry) return registry.value >= 0;
    return isExplicitIncomeRoute;
  }, [isExplicitIncomeRoute, registry]);

  function onNavigate(route: AccountTransactionRoute) {
    switch (true) {
      case route instanceof ToPreviousRoute:
        navigate(-1);
        break;

      default:
        console.warn("Unknown route type", route);
        break;
    }
  }

  async function onSubmit(data: AccountTransactionForm) {
    const accountId = data.account;
    if (!accountId || !data.description.trim()) {
      window.alert(Lang.commons.fillAllFields);
      return;
    }

    const normalizedValue = Math.abs(data.amount) * (isIncome ? 1 : -1);
    const nextRegistry = new AccountsRegistry(
      registry?.id || "",
      registry?.type ?? RegistryType.ACCOUNT,
      accountId,
      normalizedValue,
      data.description.trim(),
      new Date(data.date),
      data.isPaid || registry?.type === RegistryType.TRANSFER,
      data.tags || [],
      data.category || undefined,
      data.notes || undefined,
      registry?.relatedInfo
    );

    await getRepositories().accountTransactions.set(nextRegistry);
    navigate("/timeline");
  }

  return {
    navigate: onNavigate,
    isEdit,
    isIncome,
    register,
    accounts,
    categories,
    handleSubmit,
    onSubmit,
    setValue,
    watch,
  };
}
