import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { SelectListOption } from "@components/ui/select-list";
import { CreditCard } from "@models";
import getRepositories, { waitUntilReady } from "@repositories";
import {
  CreateCreditCardRoute,
  CreditCardForm,
  CreditCardViewModel,
  ToPreviousRoute,
} from "@layouts/credit-cards/CreateCreditCard";

function buildBrandOptions(): SelectListOption[] {
  return [
    { label: "Visa", value: "visa" },
    { label: "Mastercard", value: "mastercard" },
    { label: "American Express", value: "american express" },
    { label: "Elo", value: "elo" },
    { label: "Hipercard", value: "hipercard" },
    { label: "Diners Club", value: "diners club" },
  ];
}

function buildAccountOptions(): SelectListOption[] {
  return getRepositories()
    .accounts
    .getCacheWithBank(false)
    .map((account) => ({
      label: account.name,
      value: account.id,
      iconUrl: account.bank.logoUrl,
      backgroundColor: account.color,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function useCreateCreditCardModel(): CreditCardViewModel {
  const router = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const [accounts, setAccounts] = useState<SelectListOption[]>([]);
  const brands = useMemo(() => buildBrandOptions(), []);

  const { register, handleSubmit, setValue, watch, reset } = useForm<CreditCardForm>({
    defaultValues: {
      name: "",
      limit: 0,
      brand: "",
      account: "",
      closingDay: 1,
      dueDay: 10,
    },
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      await waitUntilReady("accounts", "banks", "creditCards");
      if (!active) return;

      setAccounts(buildAccountOptions());

      const creditCard = id ? getRepositories().creditCards.getLocalById(id) : undefined;
      if (!creditCard) return;

      reset({
        name: creditCard.name,
        limit: creditCard.limit,
        brand: creditCard.brand,
        account: creditCard.accountId,
        closingDay: creditCard.closingDay,
        dueDay: creditCard.dueDay,
      });
    };

    load();

    return () => {
      active = false;
    };
  }, [id, reset]);

  async function onSubmit(data: CreditCardForm) {
    if (!data.name.trim() || !data.account || !data.brand) {
      window.alert(Lang.commons.fillAllFields);
      return;
    }

    const current = id ? getRepositories().creditCards.getLocalById(id) : undefined;
    const nextCard = new CreditCard(
      current?.id || "",
      data.name.trim(),
      data.limit,
      data.brand,
      data.account,
      data.closingDay,
      data.dueDay,
      current?.archived ?? false,
      current?.importInfo,
    );

    await getRepositories().creditCards.set(nextCard);
    router("/creditcards");
  }

  function navigate(route: CreateCreditCardRoute) {
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
    brands,
    accounts,
  };
}
