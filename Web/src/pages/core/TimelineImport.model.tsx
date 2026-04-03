import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import getRepositories, { waitUntilReady } from "@repositories";
import { AccountsRegistry, CreditCard, CreditCardRegistry, RegistryType } from "@models";
import { parseOfx, ParsedOfxTransaction } from "@features/tabs/timeline/ofxParser";
import { analyzeOfxDuplicates, DuplicateAnalysisItem } from "./TimelineImportDuplicates.helper";

import { TimelineImportViewModel } from "@layouts/core/TimelineImport";

type ImportType = "account" | "credit";

interface TimelineImportState {
  importType: ImportType;
  selectedAccountId: string;
  selectedCardId: string;
  transactions: ParsedOfxTransaction[];
  selectedPreviewIds: string[];
  fileName: string;
  isLoadingFile: boolean;
  isImporting: boolean;
  error: string | null;
  duplicateHints: Record<string, DuplicateAnalysisItem>;
}

let timelineImportScreenStateMemory: TimelineImportState | null = null;

function buildPreviewId(transaction: ParsedOfxTransaction): string {
  return `${transaction.fitId ?? transaction.description}-${transaction.date.getTime()}-${transaction.amount}`;
}

function buildAccountTransactionSignature({ fitId, amount, date, description }: ParsedOfxTransaction): string {
  if (fitId) {
    return `ofx:fit:${fitId}`;
  }

  const normalizedAmount = (Math.round(amount * 100) / 100).toFixed(2);
  const normalizedDate = date.toISOString().slice(0, 10);
  const normalizedDescription = description.replace(/\s+/g, " ").trim().toLowerCase();

  return `ofx:${normalizedDate}:${normalizedAmount}:${normalizedDescription}`;
}

function extractSignatureFromRelatedInfo(relatedInfo?: string): string | null {
  if (!relatedInfo) return null;

  try {
    const parsed = JSON.parse(relatedInfo);
    if (typeof parsed === "string") {
      return parsed;
    }
    if (parsed && typeof parsed === "object") {
      if (typeof parsed.signature === "string") {
        return parsed.signature;
      }
      if (typeof parsed.fitId === "string" && parsed.fitId.trim() !== "") {
        return `ofx:fit:${parsed.fitId}`;
      }
    }
  } catch {
    // keep raw payload fallback
  }

  return relatedInfo;
}

function collectAccountSignatures(accountId: string): Set<string> {
  const signatures = new Set<string>();

  getRepositories().accountTransactions
    .getCache()
    .filter((registry) => registry.accountId === accountId)
    .forEach((registry) => {
      const signature = extractSignatureFromRelatedInfo(registry.relatedInfo);
      if (signature) signatures.add(signature);
    });

  return signatures;
}

function resolveInvoiceReference(purchaseDate: Date, card: CreditCard) {
  const invoiceDate = new Date(purchaseDate);
  if (invoiceDate.getDate() > card.closingDay) {
    invoiceDate.setMonth(invoiceDate.getMonth() + 1);
  }

  return {
    month: invoiceDate.getMonth() + 1,
    year: invoiceDate.getFullYear(),
  };
}

function formatDateLabel(date: Date, hasTime: boolean, hasSeconds: boolean): string {
  const datePart = date.toLocaleDateString(CurrentLangInfo.short);
  if (!hasTime) return datePart;

  const timePart = date.toLocaleTimeString(CurrentLangInfo.short, {
    hour: "2-digit",
    minute: "2-digit",
    second: hasSeconds ? "2-digit" : undefined,
  });

  return `${datePart} ${timePart}`;
}

export function useTimelineImportModel(): TimelineImportViewModel {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const repositories = getRepositories();

  const [cards, setCards] = useState<Array<{ id: string; name: string; iconUrl?: string; backgroundColor?: string }>>([]);
  const [accountOptions, setAccountOptions] = useState<Array<{ id: string; name: string; iconUrl?: string; backgroundColor?: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const defaultAccountId = searchParams.get("account") ?? "";
  const defaultCardId = searchParams.get("card") ?? "";

  const createEmptyState = useCallback((): TimelineImportState => ({
    importType: defaultCardId && !defaultAccountId ? "credit" : "account",
    selectedAccountId: defaultAccountId,
    selectedCardId: defaultCardId,
    transactions: [],
    selectedPreviewIds: [],
    fileName: "",
    isLoadingFile: false,
    isImporting: false,
    error: null,
    duplicateHints: {},
  }), [defaultAccountId, defaultCardId]);

  const [state, setState] = useState<TimelineImportState>(() => {
    return timelineImportScreenStateMemory ?? createEmptyState();
  });

  const clearPersistedState = useCallback(() => {
    timelineImportScreenStateMemory = null;
    setState(createEmptyState());
  }, [createEmptyState]);

  useEffect(() => {
    timelineImportScreenStateMemory = state;
  }, [state]);

  useEffect(() => {
    let active = true;
    let unsubscribers: Array<() => void> = [];

    const sync = () => {
      if (!active) return;

      const nextAccounts = repositories.accounts.getCacheWithBank(true).map((account) => ({
        id: account.id,
        name: account.name,
        iconUrl: account.bank.logoUrl,
        backgroundColor: account.color,
      }));
      const nextCards = repositories.creditCards.getCacheWithBank().map((card) => ({
        id: card.id,
        name: card.name,
        iconUrl: card.bank.logoUrl,
        backgroundColor: card.color,
      }));

      setCards(nextCards);
      setAccountOptions(nextAccounts);

      setState((prev) => ({
        ...prev,
        selectedAccountId: prev.selectedAccountId || nextAccounts[0]?.id || "",
        selectedCardId: prev.selectedCardId || nextCards[0]?.id || "",
      }));
    };

    const load = async () => {
      await waitUntilReady("accounts", "banks", "creditCards", "accountTransactions");
      if (!active) return;

      sync();

      unsubscribers = [
        repositories.accounts.addUpdatedEventListenner(sync),
        repositories.creditCards.addUpdatedEventListenner(sync),
      ];
    };

    load();

    return () => {
      active = false;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [repositories]);

  const setImportType = useCallback((type: ImportType) => {
    setState((prev) => ({ ...prev, importType: type, error: null }));
  }, []);

  const setSelectedAccountId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, selectedAccountId: id, error: null }));
  }, []);

  const setSelectedCardId = useCallback((id: string) => {
    setState((prev) => ({ ...prev, selectedCardId: id, error: null }));
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onFileInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setState((prev) => ({ ...prev, isLoadingFile: true, error: null }));

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 0));
        const raw = typeof reader.result === "string"
          ? reader.result
          : new TextDecoder().decode(reader.result as ArrayBuffer);

        const parsed = parseOfx(raw);
        const selectedPreviewIds = parsed.map(buildPreviewId);

        setState((prev) => ({
          ...prev,
          transactions: parsed,
          selectedPreviewIds,
          fileName: file.name,
          isLoadingFile: false,
          error: parsed.length === 0 ? Lang.timeline.importOfxNoTransactions : null,
          duplicateHints: {},
        }));
      } catch (error) {
        console.error("Error parsing OFX file", error);
        setState((prev) => ({
          ...prev,
          transactions: [],
          selectedPreviewIds: [],
          fileName: file.name,
          isLoadingFile: false,
          error: Lang.timeline.importOfxError,
          duplicateHints: {},
        }));
      }
    };

    reader.onerror = () => {
      setState((prev) => ({
        ...prev,
        transactions: [],
        selectedPreviewIds: [],
        fileName: file.name,
        isLoadingFile: false,
        error: Lang.timeline.importOfxError,
        duplicateHints: {},
      }));
    };

    reader.readAsText(file);
    event.target.value = "";
  }, []);

  const togglePreviewItem = useCallback((previewId: string) => {
    setState((prev) => {
      const isSelected = prev.selectedPreviewIds.includes(previewId);
      return {
        ...prev,
        selectedPreviewIds: isSelected
          ? prev.selectedPreviewIds.filter((id) => id !== previewId)
          : [...prev.selectedPreviewIds, previewId],
      };
    });
  }, []);

  const formatAmount = useCallback((value: number) => {
    return value.toLocaleString(CurrentLangInfo.short, {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  }, []);

  const categoriesById = useMemo(() => {
    return new Map(
      repositories.categories.getCache().map((category) => [category.id, category.name])
    );
  }, [repositories.categories]);

  const previewItems = useMemo(() => {
    const selectedSourceName = state.importType === "credit"
      ? cards.find((item) => item.id === state.selectedCardId)?.name
      : accountOptions.find((item) => item.id === state.selectedAccountId)?.name;

    return state.transactions.map((transaction) => {
      const normalizedAmount = state.importType === "credit"
        ? Math.abs(transaction.amount)
        : transaction.amount;

      return {
        id: buildPreviewId(transaction),
        title: transaction.description,
        category: Lang.timeline.importOfx,
        account: selectedSourceName,
        amount: normalizedAmount,
        dateLabel: formatDateLabel(transaction.date, transaction.hasTime, transaction.hasSeconds),
        type: state.importType === "account" && transaction.amount >= 0 ? "income" as const : "expense" as const,
        transactionType: state.importType === "credit" ? "credit" as const : "debit" as const,
        selected: state.selectedPreviewIds.includes(buildPreviewId(transaction)),
        duplicateState: state.duplicateHints[buildPreviewId(transaction)]?.state ?? "none",
        duplicateReason: state.duplicateHints[buildPreviewId(transaction)]?.reason,
        duplicateMatched: state.duplicateHints[buildPreviewId(transaction)]?.matched
          ? {
              ...state.duplicateHints[buildPreviewId(transaction)]!.matched!,
              category: categoriesById.get(state.duplicateHints[buildPreviewId(transaction)]!.matched!.categoryId || "") || "Sem categoria",
              dateLabel: state.duplicateHints[buildPreviewId(transaction)]!.matched!.date.toLocaleString(CurrentLangInfo.short),
              type: state.duplicateHints[buildPreviewId(transaction)]!.matched!.value >= 0 ? "income" as const : "expense" as const,
            }
          : undefined,
      };
    });
  }, [accountOptions, cards, state.transactions, state.importType, state.selectedAccountId, state.selectedCardId, state.selectedPreviewIds, state.duplicateHints, categoriesById]);

  const previewIncome = useMemo(() => {
    if (state.importType === "credit") return 0;
    return state.transactions
      .filter((item) => state.selectedPreviewIds.includes(buildPreviewId(item)))
      .filter((item) => item.amount > 0)
      .reduce((acc, item) => acc + item.amount, 0);
  }, [state.importType, state.selectedPreviewIds, state.transactions]);

  const previewExpense = useMemo(() => {
    if (state.importType === "credit") {
      return state.transactions
        .filter((item) => state.selectedPreviewIds.includes(buildPreviewId(item)))
        .reduce((acc, item) => acc + Math.abs(item.amount), 0);
    }
    return state.transactions
      .filter((item) => state.selectedPreviewIds.includes(buildPreviewId(item)))
      .filter((item) => item.amount < 0)
      .reduce((acc, item) => acc + Math.abs(item.amount), 0);
  }, [state.selectedPreviewIds, state.transactions, state.importType]);

  const selectedCount = state.selectedPreviewIds.length;
  const totalCount = state.transactions.length;
  const selectedWarningCount = useMemo(() => {
    return previewItems.filter((item) => item.selected && item.duplicateState === "warning").length;
  }, [previewItems]);

  useEffect(() => {
    if (!state.transactions.length) return;

    const existing = state.importType === "account"
      ? repositories.accountTransactions.getCache().filter((item) => item.accountId === state.selectedAccountId)
      : repositories.creditCardsTransactions.getCache().filter((item) => item.cardId === state.selectedCardId);

    const analysis = analyzeOfxDuplicates(state.transactions, existing);
    const blockedSet = new Set(analysis.autoDeselectedIds);

    setState((prev) => {
      const nextSelected = prev.selectedPreviewIds.filter((id) => !blockedSet.has(id));
      return {
        ...prev,
        selectedPreviewIds: nextSelected,
        duplicateHints: analysis.byPreviewId,
      };
    });
  }, [
    repositories.accountTransactions,
    repositories.creditCardsTransactions,
    state.importType,
    state.selectedAccountId,
    state.selectedCardId,
    state.transactions,
  ]);

  const importAccounts = useCallback(async (entries: ParsedOfxTransaction[], accountId: string) => {
    const existingSignatures = collectAccountSignatures(accountId);

    const registries = entries.reduce<AccountsRegistry[]>((acc, transaction) => {
      const signature = buildAccountTransactionSignature(transaction);
      if (existingSignatures.has(signature)) {
        return acc;
      }

      existingSignatures.add(signature);

      const importMeta = JSON.stringify({
        source: "ofx",
        fileName: state.fileName,
        fitId: transaction.fitId ?? null,
        signature,
      });

      acc.push(
        new AccountsRegistry(
          crypto.randomUUID(),
          RegistryType.ACCOUNT,
          accountId,
          Math.round(transaction.amount * 100) / 100,
          transaction.description,
          transaction.date,
          true,
          [],
          undefined,
          undefined,
          importMeta,
        )
      );

      return acc;
    }, []);

    await repositories.accountTransactions.saveAll(registries);
  }, [repositories.accountTransactions, state.fileName]);

  const importCredit = useCallback(async (entries: ParsedOfxTransaction[], cardId: string) => {
    const card = repositories.creditCards.getCacheWithBank().find((item) => item.id === cardId)
      ?? repositories.creditCards.getLocalById(cardId);

    if (!card) throw new Error("Credit card not found");

    const registries = entries.map(({ amount, date, description, fitId }) => {
      const { month, year } = resolveInvoiceReference(date, card as CreditCard);

      return new CreditCardRegistry(
        crypto.randomUUID(),
        cardId,
        month,
        year,
        date,
        description,
        Math.round(Math.abs(amount) * 100) / 100,
        [],
        undefined,
        undefined,
        {
          source: "ofx",
          fileName: state.fileName,
          fitId: fitId ?? null,
        }
      );
    });

    await repositories.creditCardsTransactions.saveAll(registries);
  }, [repositories.creditCards, repositories.creditCardsTransactions, state.fileName]);

  const importTransactions = useCallback(async () => {
    const selectedTransactions = state.transactions.filter((item) =>
      state.selectedPreviewIds.includes(buildPreviewId(item))
    );

    if (!selectedTransactions.length) {
      setState((prev) => ({ ...prev, error: Lang.timeline.importOfxNoTransactions }));
      return;
    }

    if (state.importType === "account" && !state.selectedAccountId) {
      setState((prev) => ({ ...prev, error: Lang.commons.fillAllFields }));
      return;
    }

    if (state.importType === "credit" && !state.selectedCardId) {
      setState((prev) => ({ ...prev, error: Lang.commons.fillAllFields }));
      return;
    }

    setState((prev) => ({ ...prev, isImporting: true, error: null }));

    try {
      if (state.importType === "account") {
        await importAccounts(selectedTransactions, state.selectedAccountId);
      } else {
        await importCredit(selectedTransactions, state.selectedCardId);
      }

      alert(Lang.timeline.importOfxSuccess);
      clearPersistedState();
      navigate("/timeline");
    } catch (error) {
      console.error("OFX import failed", error);
      setState((prev) => ({ ...prev, error: Lang.timeline.importOfxError }));
    } finally {
      setState((prev) => ({ ...prev, isImporting: false }));
    }
  }, [clearPersistedState, importAccounts, importCredit, navigate, state]);

  const status = useMemo(() => {
    if (state.isLoadingFile) return Lang.commons.loading;
    if (state.error) return state.error;
    if (state.transactions.length > 0) {
      return Lang.timeline.importOfxLoaded(state.transactions.length);
    }
    return null;
  }, [state.error, state.isLoadingFile, state.transactions.length]);

  return {
    goBack: () => {
      clearPersistedState();
      navigate(-1);
    },
    importType: state.importType,
    setImportType,
    accountOptions,
    selectedAccountId: state.selectedAccountId,
    setSelectedAccountId,
    cardOptions: cards,
    selectedCardId: state.selectedCardId,
    setSelectedCardId,
    fileName: state.fileName,
    openFilePicker,
    onFileInputChange,
    fileInputRef,
    isLoadingFile: state.isLoadingFile,
    isImporting: state.isImporting,
    error: state.error,
    status,
    previewItems,
    previewIncome,
    previewExpense,
    selectedCount,
    totalCount,
    selectedWarningCount,
    importTransactions,
    togglePreviewItem,
    hasPreview: previewItems.length > 0,
    formatAmount,
  };
}
