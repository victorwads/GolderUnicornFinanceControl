import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { SelectListOption } from "@components/ui/select-list";
import {
  CreateTransferRoute,
  CreateTransferViewModel,
  ToPreviousRoute,
  TransferForm,
} from "@layouts/transactions/CreateTransfer";
import { TransferTransaction } from "@models";
import { buildTimelineReturnPath, isTimelineDetailPath } from "@pages/core/timelineDetailNavigation";
import getRepositories, { waitUntilReady } from "@repositories";

function toDateInputValue(date: Date): string {
  return new Date(date.getTime() - (date.getTimezoneOffset() * 60_000)).toISOString().slice(0, 10);
}

function buildAccountOptions(): SelectListOption[] {
  return getRepositories()
    .accounts
    .getCacheWithBank(true)
    .map((account) => ({
      label: account.name,
      value: account.id,
      iconUrl: account.bank.logoUrl,
      backgroundColor: account.color,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function useCreateTransferModel(): CreateTransferViewModel {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<SelectListOption[]>([]);

  const { register, handleSubmit, setValue, watch } = useForm<TransferForm>({
    defaultValues: {
      fromAccount: "",
      toAccount: "",
      amount: 0,
      date: toDateInputValue(new Date()),
      tags: [],
      notes: "",
    },
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      await waitUntilReady("accounts", "banks", "accountTransactions");
      if (!active) return;

      const availableAccounts = buildAccountOptions();
      setAccounts(availableAccounts);

      const accountFromQuery = searchParams.get("account") || "";
      const defaultFrom = accountFromQuery || availableAccounts[0]?.value || "";
      const defaultTo = availableAccounts.find((account) => account.value !== defaultFrom)?.value || "";

      if (defaultFrom) setValue("fromAccount", defaultFrom);
      if (defaultTo) setValue("toAccount", defaultTo);
    };

    load();

    return () => {
      active = false;
    };
  }, [searchParams, setValue]);

  async function onSubmit(data: TransferForm) {
    const description = data.notes.trim() || "Transferência";
    const amount = Math.abs(data.amount);

    if (!data.fromAccount || !data.toAccount || !amount) {
      window.alert(Lang.commons.fillAllFields);
      return;
    }

    if (data.fromAccount === data.toAccount) {
      window.alert("A conta de origem e destino devem ser diferentes.");
      return;
    }

    const transfer = new TransferTransaction(
      "",
      {
        transferId: crypto.randomUUID(),
        sourceAccountId: data.fromAccount,
        targetAccountId: data.toAccount,
      },
      data.fromAccount,
      new Date(data.date),
      description,
      amount,
      data.tags || [],
      data.notes || undefined,
    );

    await getRepositories().accountTransactions.saveAll(transfer.toTuple());
    if (isTimelineDetailPath(location.pathname)) {
      navigate(buildTimelineReturnPath(location.search));
      return;
    }

    navigate("/timeline");
  }

  function onNavigate(route: CreateTransferRoute) {
    switch (true) {
      case route instanceof ToPreviousRoute:
        if (isTimelineDetailPath(location.pathname)) {
          navigate(buildTimelineReturnPath(location.search));
          break;
        }
        navigate(-1);
        break;

      default:
        console.warn("Unknown route type", route);
        break;
    }
  }

  return {
    navigate: onNavigate,
    isEdit: false,
    register,
    handleSubmit,
    setValue,
    watch,
    onSubmit,
    accounts,
  };
}
