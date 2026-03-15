import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { SelectListOption } from "@components/ui/select-list";
import { Account, AccountType } from "@models";
import getRepositories, { waitUntilReady } from "@repositories";
import {
  BankAccountForm,
  BankAccountViewModel,
  CreateBankAccountRoute,
  ToPreviousRoute,
} from "@layouts/accounts/CreateBankAccount";

function buildBankOptions(): SelectListOption[] {
  return getRepositories()
    .banks
    .getCache()
    .map((bank) => ({
      label: bank.name,
      value: bank.id,
      iconUrl: bank.logoUrl,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

function buildAccountTypes(): SelectListOption[] {
  return [
    { label: Lang.accounts.types.current, value: AccountType.CURRENT },
    { label: Lang.accounts.types.savings, value: AccountType.SAVINGS },
    { label: Lang.accounts.types.investment, value: AccountType.INVESTMENT },
    { label: Lang.accounts.types.cash, value: AccountType.CASH },
  ];
}

export function useCreateBankAccountModel(): BankAccountViewModel {
  const router = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const [banks, setBanks] = useState<SelectListOption[]>([]);
  const accountTypes = buildAccountTypes();

  const { register, handleSubmit, setValue, watch, reset } = useForm<BankAccountForm>({
    defaultValues: {
      name: "",
      initialBalance: 0,
      bank: "",
      type: AccountType.CURRENT,
      color: "#3b82f6",
      includeInTotal: false,
    },
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      await waitUntilReady("banks", "accounts");
      if (!active) return;

      setBanks(buildBankOptions());

      const account = id ? getRepositories().accounts.getLocalById(id) : undefined;
      if (!account) return;

      reset({
        name: account.name,
        initialBalance: account.initialBalance,
        bank: account.bankId,
        type: account.type,
        color: account.color || "#3b82f6",
        includeInTotal: account.includeInTotal,
      });
    };

    load();

    return () => {
      active = false;
    };
  }, [id, reset]);

  async function onSubmit(data: BankAccountForm) {
    if (!data.name.trim() || !data.bank) {
      window.alert(Lang.commons.fillAllFields);
      return;
    }

    const current = id ? getRepositories().accounts.getLocalById(id) : undefined;
    const nextAccount = new Account(
      current?.id || "",
      data.name.trim(),
      data.initialBalance,
      data.bank,
      data.type as AccountType,
      current?.archived ?? false,
      data.color,
      data.includeInTotal,
    );

    await getRepositories().accounts.set(nextAccount);
    router("/accounts");
  }

  function navigate(route: CreateBankAccountRoute) {
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
    banks,
    accountTypes,
  };
}
