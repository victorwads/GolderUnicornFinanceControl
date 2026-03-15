import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import getRepositories, { waitUntilReady } from "@repositories";
import { getServices } from "@services";
import { WithInfoAccount } from "@models";
import {
  Account,
  AccountsListViewModel,
  AccountsRoute,
  ToCreateAccountRoute,
  ToEditAccountRoute,
  ToMoreRoute,
} from "@layouts/accounts/AccountsList";

function toVisualAccounts(accounts: WithInfoAccount[]): Account[] {
  const { balance } = getServices();

  return accounts.map((account) => ({
    id: account.id as unknown as number,
    name: account.name,
    bank: account.bank.name,
    balance: balance.getBalance(account.id),
    color: account.color || "#64748b",
  }));
}

export function useAccountsListModel(): AccountsListViewModel {
  const router = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    let active = true;
    let dispose: Array<() => void> = [];

    const sync = () => {
      if (!active) return;
      setAccounts(toVisualAccounts(getRepositories().accounts.getCacheWithBank(false)));
    };

    const load = async () => {
      await waitUntilReady("banks", "accounts", "accountTransactions", "creditCardsInvoices");
      if (!active) return;

      sync();

      const repositories = getRepositories();
      dispose = [
        repositories.accounts.addUpdatedEventListenner(sync),
        repositories.accountTransactions.addUpdatedEventListenner(sync),
        repositories.creditCardsInvoices.addUpdatedEventListenner(sync),
      ];
    };

    load();

    return () => {
      active = false;
      dispose.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  function navigate(route: AccountsRoute) {
    switch (true) {
      case route instanceof ToMoreRoute:
        router("/settings");
        break;

      case route instanceof ToCreateAccountRoute:
        router("/accounts/create");
        break;

      case route instanceof ToEditAccountRoute:
        router(`/accounts/${route.accountId}`);
        break;

      default:
        console.warn("Unknown route type", route);
        break;
    }
  }

  return {
    navigate,
    accounts,
  };
}
