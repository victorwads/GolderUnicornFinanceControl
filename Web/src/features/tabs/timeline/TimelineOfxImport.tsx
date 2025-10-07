import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import "./TimelineOfxImport.css";

import Dialog from "@components/visual/Dialog";
import Button from "@components/Button";
import Icon, { Icons } from "@components/Icons";

import { AccountsRegistry, CreditCard, CreditCardRegistry, RegistryType } from "@models";
import getRepositories from "@repositories";
import type { CreditCardWithInfos } from "@repositories/CreditcardsRepository";

import { parseOfx, ParsedOfxTransaction } from "./ofxParser";

type ImportType = "account" | "credit";

interface TimelineOfxImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
  defaultAccountId?: string;
  defaultCardId?: string;
  autoOpenFilePicker?: boolean;
}

const buildAccountTransactionSignature = ({
  fitId,
  amount,
  date,
  description,
}: ParsedOfxTransaction): string => {
  if (fitId) {
    return `ofx:fit:${fitId}`;
  }

  const normalizedAmount = (Math.round(amount * 100) / 100).toFixed(2);
  const normalizedDate = date.toISOString().slice(0, 10);
  const normalizedDescription = description.replace(/\s+/g, " ").trim().toLowerCase();

  return `ofx:${normalizedDate}:${normalizedAmount}:${normalizedDescription}`;
};

const extractSignatureFromRelatedInfo = (relatedInfo?: string): string | null => {
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
    // ignore parsing errors, fallback to raw value
  }

  return relatedInfo;
};

const collectAccountSignatures = (registries: AccountsRegistry[], accountId: string): Set<string> => {
  const signatures = new Set<string>();

  registries
    .filter((registry) => registry.accountId === accountId)
    .forEach((registry) => {
      const signature = extractSignatureFromRelatedInfo(registry.relatedInfo);
      if (signature) {
        signatures.add(signature);
      }
    });

  return signatures;
};

const TimelineOfxImport = ({
  isOpen,
  onClose,
  onImported,
  defaultAccountId,
  defaultCardId,
}: TimelineOfxImportProps) => {
  const repositories = getRepositories();
  const accounts = repositories.accounts.getCache();
  const creditCards = repositories.creditCards.getCacheWithBank();

  const defaults = useMemo(() => {
    const accountId = defaultAccountId ?? accounts[0]?.id;
    const cardId = defaultCardId ?? creditCards[0]?.id;
    const type: ImportType = defaultAccountId
      ? "account"
      : defaultCardId
      ? "credit"
      : accountId
      ? "account"
      : "credit";

    return { accountId, cardId, type };
  }, [accounts, creditCards, defaultAccountId, defaultCardId]);

  interface ImportState {
    importType: ImportType;
    selectedAccountId?: string;
    selectedCardId?: string;
    transactions: ParsedOfxTransaction[];
    error: string | null;
    fileName: string;
    isLoadingFile: boolean;
    isImporting: boolean;
  }

  const [state, setState] = useState<ImportState>(() => ({
    importType: defaults.type,
    selectedAccountId: defaults.accountId,
    selectedCardId: defaults.cardId,
    transactions: [],
    error: null,
    fileName: "",
    isLoadingFile: false,
    isImporting: false,
  }));

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetFileInput = useCallback(() => {
    const input = fileInputRef.current;
    if (input) {
      input.value = "";
    }
  }, []);

  const resetState = useCallback(() => {
    setState(() => ({
      importType: defaults.type,
      selectedAccountId: defaults.accountId,
      selectedCardId: defaults.cardId,
      transactions: [],
      error: null,
      fileName: "",
      isLoadingFile: false,
      isImporting: false,
    }));
    resetFileInput();
  }, [defaults, resetFileInput]);

  useEffect(() => {
    if (!fileInputRef.current) return;
    setTimeout(() => fileInputRef.current?.click(), 1000)
  }, [fileInputRef.current]);

  const {
    importType,
    selectedAccountId,
    selectedCardId,
    transactions,
    error,
    fileName,
    isLoadingFile,
    isImporting,
  } = state;

  const summaryTotal = useMemo(() => {
    if (importType === "credit") {
      return transactions.reduce((acc, item) => acc + Math.abs(item.amount), 0);
    }
    return transactions.reduce((acc, item) => acc + item.amount, 0);
  }, [transactions, importType]);

  const formatCurrency = (value: number) =>
    value.toLocaleString(CurrentLangInfo.short, {
      style: "currency",
      currency: "BRL",
    });

  const handleTypeChange = (type: ImportType) => {
    setState((prev) => {
      const next: ImportState = { ...prev, importType: type };
      if (type === "account" && !next.selectedAccountId && defaults.accountId) {
        next.selectedAccountId = defaults.accountId;
      }
      if (type === "credit" && !next.selectedCardId && defaults.cardId) {
        next.selectedCardId = defaults.cardId;
      }
      return next;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setState((prev) => ({ ...prev, isLoadingFile: true, error: null }));

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw =
          typeof reader.result === "string"
            ? reader.result
            : new TextDecoder().decode(reader.result as ArrayBuffer);
        const parsed = parseOfx(raw);
        setState((prev) => ({
          ...prev,
          transactions: parsed,
          fileName: file.name,
          isLoadingFile: false,
          error: parsed.length === 0 ? Lang.timeline.importOfxNoTransactions : null,
        }));
      } catch (err) {
        console.error("Error parsing OFX file", err);
        setState((prev) => ({
          ...prev,
          transactions: [],
          isLoadingFile: false,
          error: Lang.timeline.importOfxError,
        }));
      }
    };
    reader.onerror = () => {
      console.error("Error reading OFX file");
      setState((prev) => ({
        ...prev,
        transactions: [],
        isLoadingFile: false,
        error: Lang.timeline.importOfxError,
      }));
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (transactions.length === 0) {
      setState((prev) => ({ ...prev, error: Lang.timeline.importOfxNoTransactions }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isImporting: true, error: null }));

      if (importType === "account") {
        if (!selectedAccountId) {
          setState((prev) => ({ ...prev, error: Lang.commons.fillAllFields }));
          return;
        }
        await importAccounts(transactions, selectedAccountId, fileName);
      } else {
        if (!selectedCardId) {
          setState((prev) => ({ ...prev, error: Lang.commons.fillAllFields }));
          return;
        }
        await importCredit(transactions, selectedCardId, creditCards, fileName);
      }

      alert(Lang.timeline.importOfxSuccess);
      resetState();
      onImported();
    } catch (err) {
      console.error("OFX import failed", err);
      setState((prev) => ({ ...prev, error: Lang.timeline.importOfxError }));
    } finally {
      setState((prev) => ({ ...prev, isImporting: false }));
    }
  };

  const importAccounts = async (
    entries: ParsedOfxTransaction[],
    accountId: string,
    sourceFile: string
  ) => {
    const { accountTransactions: accountRegistries } = getRepositories();

    const existingSignatures = collectAccountSignatures(accountRegistries.getCache(), accountId);
    const registries = entries.reduce<AccountsRegistry[]>((acc, transaction) => {
      const signature = buildAccountTransactionSignature(transaction);
      if (existingSignatures.has(signature)) {
        return acc;
      }

      existingSignatures.add(signature);
      const value = Math.round(transaction.amount * 100) / 100;
      const importMeta = JSON.stringify({
        source: "ofx",
        fileName: sourceFile,
        fitId: transaction.fitId ?? null,
        signature,
      });

      acc.push(
        new AccountsRegistry(
          crypto.randomUUID(),
          RegistryType.ACCOUNT,
          accountId,
          value,
          transaction.description,
          transaction.date,
          true,
          [],
          undefined,
          undefined,
          importMeta
        )
      );

      return acc;
    }, []);

    await accountRegistries.saveAll(registries);
  };

  const importCredit = async (
    entries: ParsedOfxTransaction[],
    cardId: string,
    cards: CreditCardWithInfos[],
    sourceFile: string
  ) => {
    const { creditCardsTransactions: creditCardsRegistries, creditCards } = getRepositories();
    const card = cards.find((c) => c.id === cardId) ?? creditCards.getLocalById(cardId);
    if (!card) {
      throw new Error("Credit card not found");
    }

    const registries = entries.map(
      ({ amount, date, description, fitId }): CreditCardRegistry => {
        const normalizedAmount = Math.round(Math.abs(amount) * 100) / 100;
        const { month, year } = resolveInvoiceReference(date, card);
        return new CreditCardRegistry(
          crypto.randomUUID(),
          card.id,
          month,
          year,
          date,
          description,
          normalizedAmount,
          [],
          undefined,
          undefined,
          {
            source: "ofx",
            fileName: sourceFile,
            fitId: fitId ?? null,
          }
        );
      }
    );

    await creditCardsRegistries.saveAll(registries);
  };

  const resolveInvoiceReference = (purchaseDate: Date, card: CreditCard) => {
    const invoiceDate = new Date(purchaseDate);
    if (invoiceDate.getDate() > card.closingDay) {
      invoiceDate.setMonth(invoiceDate.getMonth() + 1);
    }
    return {
      month: invoiceDate.getMonth() + 1,
      year: invoiceDate.getFullYear(),
    };
  };

  const status = useMemo(() => {
    if (isLoadingFile) {
      return { text: Lang.commons.loading, tone: "info" as const };
    }
    if (error) {
      return { text: error, tone: "error" as const };
    }
    if (transactions.length > 0) {
      return {
        text: `${Lang.timeline.importOfxLoaded(transactions.length)} • ${formatCurrency(
          summaryTotal
        )}`,
        tone: "success" as const,
      };
    }
    return null;
  }, [isLoadingFile, error, transactions.length, summaryTotal]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const selectedCard = selectedCardId
    ? creditCards.find((card) => card.id === selectedCardId)
    : undefined;

  return (
    <>
      <div className="TimelineOfxImport">
        <div className="TimelineOfxImport__header">
          <h2 className="TimelineOfxImport__title">{Lang.timeline.importOfxTitle}</h2>
          <button
            type="button"
            className="TimelineOfxImport__close"
            onClick={handleClose}
            aria-label={Lang.commons.cancel}
          >
            <Icon icon={Icons.faClose} />
          </button>
        </div>

        <div className="TimelineOfxImport__type">
          <label>
            <input
              type="radio"
              name="ofxImportType"
              value="account"
              checked={importType === "account"}
              onChange={() => handleTypeChange("account")}
            />{" "}
            {Lang.timeline.importOfxAccountOption}
          </label>
          <label>
            <input
              type="radio"
              name="ofxImportType"
              value="credit"
              checked={importType === "credit"}
              onChange={() => handleTypeChange("credit")}
            />{" "}
            {Lang.timeline.importOfxCreditOption}
          </label>
        </div>

        <div className="TimelineOfxImport__form">
          {importType === "account" ? (
            <label>
              {Lang.timeline.importOfxAccountLabel}
              <select
                value={selectedAccountId ?? ""}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    selectedAccountId: event.target.value || undefined,
                  }))
                }
              >
                <option value="">{Lang.commons.selectOption(Lang.timeline.importOfxAccountLabel)}</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              {Lang.timeline.importOfxCardLabel}
              <select
                value={selectedCardId ?? ""}
                onChange={(event) =>
                  setState((prev) => ({
                    ...prev,
                    selectedCardId: event.target.value || undefined,
                  }))
                }
              >
                <option value="">{Lang.commons.selectOption(Lang.timeline.importOfxCardLabel)}</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            {Lang.timeline.importOfxFileLabel}
            <input
              type="file"
              accept=".ofx"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div
          className={[
            "TimelineOfxImport__status",
            status ? `TimelineOfxImport__status--${status.tone}` : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {status && <span>{status.text}</span>}
        </div>

        {transactions.length > 0 && (
          <div className="TimelineOfxImport__preview">
            {importType === "credit" && selectedCard && (
              <div>
                <strong>{selectedCard.name}</strong> • {Lang.creditcards.closingDay}:{" "}
                {selectedCard.closingDay}
              </div>
            )}
            <div className="TimelineOfxImport__tableWrapper">
              <table className="TimelineOfxImport__table">
                <thead>
                  <tr>
                    <th>{Lang.registry.date}</th>
                    <th>{Lang.registry.description}</th>
                    <th>{Lang.registry.value}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(({ date, description, amount, fitId }) => (
                    <tr key={`${fitId ?? description}-${date.getTime()}-${amount}`}>
                      <td>{date.toLocaleDateString(CurrentLangInfo.short)}</td>
                      <td>{description}</td>
                      <td
                        className={`TimelineOfxImport__amount ${
                          amount >= 0 ? "positive" : "negative"
                        }`}
                      >
                        {formatCurrency(importType === "credit" ? Math.abs(amount) : amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="TimelineOfxImport__actions">
          <Button text={Lang.commons.cancel} onClick={handleClose} />
          <Button
            text={isImporting ? Lang.commons.loading : Lang.timeline.importOfxImport}
            disabled={isImporting || transactions.length === 0}
            onClick={handleImport}
          />
        </div>
      </div>
    </>
  );
};

export default TimelineOfxImport;
