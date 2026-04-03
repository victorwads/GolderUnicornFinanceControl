import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import getRepositories, { waitUntilReady } from "@repositories";
import { CreditCardInvoice, CreditCardRegistry, RegistryType } from "@models";
import { buildTimelineReturnPath, isTimelineDetailPath } from "@pages/core/timelineDetailNavigation";
import {
  Invoice,
  InvoicesListRoute,
  InvoicesListViewModel,
  ToMoreRoute,
  Transaction,
} from "@layouts/transactions/InvoicesList";

type FilterView = "all" | "recurring" | "installments" | "single";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function toMonthValue(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function toInvoiceRouteValue(monthValue: string) {
  return monthValue.replace("-", "");
}

function parseInvoiceRouteValue(selected?: string) {
  if (!selected || !/^\d{6}$/.test(selected)) return undefined;
  return `${selected.slice(0, 4)}-${selected.slice(4, 6)}`;
}

function formatMonthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  return `${MONTHS[month - 1]}/${String(year).slice(2)}`;
}

function buildMonthTabs(selectedMonth: string) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const tabs: Array<{ value: string; label: string }> = [];

  for (let index = -3; index <= 3; index++) {
    const date = new Date(year, month - 1 + index, 1);
    const value = toMonthValue(date.getFullYear(), date.getMonth() + 1);
    tabs.push({
      value,
      label: formatMonthLabel(value),
    });
  }

  return tabs;
}

function formatInvoiceDate(day: number, monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(CurrentLangInfo.short, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function isInvoiceClosed(monthValue: string) {
  const now = new Date();
  return monthValue < toMonthValue(now.getFullYear(), now.getMonth() + 1);
}

function createVirtualInvoice(cardId: string, monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  return new CreditCardInvoice(
    "",
    cardId,
    new Date(year, month - 1, 1),
    year,
    month,
    0,
  );
}

function mapRegistryToTransaction(registry: CreditCardRegistry): Transaction {
  const repositories = getRepositories();
  const category = registry.categoryId ? repositories.categories.getLocalById(registry.categoryId) : undefined;
  const accountName = repositories.creditCards.getLocalById(registry.cardId)?.name || "";

  return {
    id: Number(registry.id.replace(/\D/g, "").slice(-10) || Date.now()),
    title: registry.description,
    category: category?.name || "Sem categoria",
    amount: Math.abs(registry.value),
    date: registry.date.toLocaleDateString(CurrentLangInfo.short, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    type: registry.value >= 0 ? "income" : "expense",
    transactionType: registry.type === RegistryType.CREDIT_RECURRENT ? "recurring" : "credit",
    tags: registry.tags || [],
    account: accountName,
    categoryIconName: category?.icon,
    categoryColor: category?.color,
  };
}

export function useInvoicesListModel(): InvoicesListViewModel {
  const router = useNavigate();
  const location = useLocation();
  const { id, selected } = useParams<{ id?: string; selected?: string }>();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [filterView, setFilterView] = useState<FilterView>("all");
  const [selectedMonth, setSelectedMonthState] = useState(() => parseInvoiceRouteValue(selected) || toMonthValue(new Date().getFullYear(), new Date().getMonth() + 1));
  const [creditCardName, setCreditCardName] = useState("");
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>({
    monthYear: selectedMonth,
    closeDate: "",
    dueDate: "",
    isClosed: false,
    isPaid: false,
    totalAmount: 0,
    transactions: [],
  });

  useEffect(() => {
    setSelectedMonthState((current) => parseInvoiceRouteValue(selected) || current);
  }, [selected]);

  useEffect(() => {
    let active = true;
    let dispose: Array<() => void> = [];

    const sync = () => {
      if (!active || !id) return;

      const repositories = getRepositories();
      const creditCard = repositories.creditCards.getLocalById(id);
      const invoices = repositories.creditCardsInvoices.getInvoices(id);
      const selectedFromRoute = parseInvoiceRouteValue(selected);
      const currentInvoice = invoices.find((invoice) => invoice.name === CreditCardInvoice.nowName());
      const fallbackMonth =
        (currentInvoice ? toMonthValue(currentInvoice.year, currentInvoice.month) : undefined)
        || (invoices[invoices.length - 1] ? toMonthValue(invoices[invoices.length - 1].year, invoices[invoices.length - 1].month) : toMonthValue(new Date().getFullYear(), new Date().getMonth() + 1));

      const resolvedMonth = selectedFromRoute || fallbackMonth;
      const matchedInvoice = invoices.find((invoice) => toMonthValue(invoice.year, invoice.month) === resolvedMonth);
      const selectedInvoice = matchedInvoice
        || (selectedFromRoute ? createVirtualInvoice(id, resolvedMonth) : invoices[invoices.length - 1]);

      setSelectedMonthState(resolvedMonth);
      setCreditCardName(creditCard?.name || "Cartão");

      if (!selectedInvoice || !creditCard) {
        setCurrentInvoice({
          monthYear: resolvedMonth,
          closeDate: "",
          dueDate: "",
          isClosed: isInvoiceClosed(resolvedMonth),
          isPaid: false,
          totalAmount: 0,
          transactions: [],
        });
        return;
      }

      const monthValue = toMonthValue(selectedInvoice.year, selectedInvoice.month);
      const transactions = repositories.creditCardsTransactions
        .getRegistriesByInvoice(selectedInvoice)
        .sort((left, right) => right.date.getTime() - left.date.getTime())
        .map((registry) => mapRegistryToTransaction(registry));

      setCurrentInvoice({
        monthYear: monthValue,
        closeDate: formatInvoiceDate(creditCard.closingDay, monthValue),
        dueDate: formatInvoiceDate(creditCard.dueDay, monthValue),
        isClosed: isInvoiceClosed(monthValue),
        isPaid: selectedInvoice.paid,
        totalAmount: selectedInvoice.value,
        transactions,
      });
    };

    const load = async () => {
      await waitUntilReady("creditCards", "creditCardsInvoices", "creditCardsTransactions", "categories");
      if (!active) return;

      sync();

      const repositories = getRepositories();
      dispose = [
        repositories.creditCards.addUpdatedEventListenner(sync),
        repositories.creditCardsInvoices.addUpdatedEventListenner(sync),
        repositories.creditCardsTransactions.addUpdatedEventListenner(sync),
        repositories.categories.addUpdatedEventListenner(sync),
      ];
    };

    load();

    return () => {
      active = false;
      dispose.forEach((unsubscribe) => unsubscribe());
    };
  }, [id, selected]);

  const monthTabs = useMemo(() => buildMonthTabs(selectedMonth), [selectedMonth]);

  const filteredTransactions = useMemo(() => {
    switch (filterView) {
      case "recurring":
        return currentInvoice.transactions.filter((transaction) => transaction.transactionType === "recurring");
      case "installments":
        return currentInvoice.transactions.filter((transaction) => Boolean(transaction.installmentInfo));
      case "single":
        return currentInvoice.transactions.filter((transaction) => transaction.transactionType !== "recurring" && !transaction.installmentInfo);
      default:
        return currentInvoice.transactions;
    }
  }, [currentInvoice.transactions, filterView]);

  const groupedTransactions = useMemo(() => {
    if (filterView !== "all") return null;

    return {
      recurring: currentInvoice.transactions.filter((transaction) => transaction.transactionType === "recurring"),
      installments: currentInvoice.transactions.filter((transaction) => Boolean(transaction.installmentInfo)),
      single: currentInvoice.transactions.filter((transaction) => transaction.transactionType !== "recurring" && !transaction.installmentInfo),
    };
  }, [currentInvoice.transactions, filterView]);

  function setSelectedMonth(month: string) {
    if (!id) return;
    router(`/creditcards/${id}/invoices/${toInvoiceRouteValue(month)}`);
  }

  function navigate(route: InvoicesListRoute) {
    switch (true) {
      case route instanceof ToMoreRoute:
        if (isTimelineDetailPath(location.pathname)) {
          router(buildTimelineReturnPath(location.search));
          return;
        }
        router("/creditcards");
        return;

      default:
        console.warn("Unknown route type", route);
    }
  }

  return {
    navigate,
    creditCardName,
    selectedMonth,
    setSelectedMonth,
    pickerOpen,
    setPickerOpen,
    filterView,
    setFilterView,
    monthTabs,
    currentInvoice,
    filteredTransactions,
    groupedTransactions,
    navigateMonth: (direction) => {
      const [year, month] = selectedMonth.split("-").map(Number);
      const nextDate = new Date(year, month - 1 + (direction === "next" ? 1 : -1), 1);
      setSelectedMonth(toMonthValue(nextDate.getFullYear(), nextDate.getMonth() + 1));
    },
  };
}
