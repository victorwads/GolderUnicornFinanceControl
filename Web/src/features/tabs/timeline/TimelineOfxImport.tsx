import { useEffect, useMemo, useState } from "react";

import "./TimelineOfxImport.css";

import Dialog from "@components/visual/Dialog";
import Button from "@components/Button";
import Icon from "@components/Icons";

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
}

const TimelineOfxImport = ({
  isOpen,
  onClose,
  onImported,
  defaultAccountId,
}: TimelineOfxImportProps) => {
  const repositories = getRepositories();
  const accounts = repositories.accounts.getCache();
  const creditCards = repositories.creditCards.getCacheWithBank();

  const [importType, setImportType] = useState<ImportType>("account");
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(
    defaultAccountId || accounts[0]?.id
  );
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(
    creditCards[0]?.id
  );
  const [transactions, setTransactions] = useState<ParsedOfxTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setImportType(defaultAccountId ? "account" : "account");
    setSelectedAccountId(defaultAccountId || accounts[0]?.id);
    setSelectedCardId((prev) => prev || creditCards[0]?.id);
    setTransactions([]);
    setError(null);
    setFileName("");
    setIsLoadingFile(false);
    setIsImporting(false);
    setFileInputKey((value) => value + 1);
  }, [isOpen, defaultAccountId, accounts, creditCards]);

  useEffect(() => {
    if (!isOpen) return;

    if (importType === "account") {
      if (!selectedAccountId && accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
    } else if (importType === "credit") {
      if (!selectedCardId && creditCards.length > 0) {
        setSelectedCardId(creditCards[0].id);
      }
    }
  }, [importType, isOpen, accounts, creditCards, selectedAccountId, selectedCardId]);

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

  const resetFileInput = () => setFileInputKey((value) => value + 1);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoadingFile(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw =
          typeof reader.result === "string"
            ? reader.result
            : new TextDecoder().decode(reader.result as ArrayBuffer);
        const parsed = parseOfx(raw);
        setTransactions(parsed);
        setFileName(file.name);
        if (parsed.length === 0) {
          setError(Lang.timeline.importOfxNoTransactions);
        }
      } catch (err) {
        console.error("Error parsing OFX file", err);
        setTransactions([]);
        setError(Lang.timeline.importOfxError);
      } finally {
        setIsLoadingFile(false);
      }
    };
    reader.onerror = () => {
      console.error("Error reading OFX file");
      setTransactions([]);
      setError(Lang.timeline.importOfxError);
      setIsLoadingFile(false);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (transactions.length === 0) {
      setError(Lang.timeline.importOfxNoTransactions);
      return;
    }

    try {
      setIsImporting(true);
      setError(null);

      if (importType === "account") {
        if (!selectedAccountId) {
          setError(Lang.commons.fillAllFields);
          return;
        }
        await importAccounts(transactions, selectedAccountId, fileName);
      } else {
        if (!selectedCardId) {
          setError(Lang.commons.fillAllFields);
          return;
        }
        await importCredit(transactions, selectedCardId, creditCards, fileName);
      }

      alert(Lang.timeline.importOfxSuccess);
      resetFileInput();
      setTransactions([]);
      setFileName("");
      onImported();
    } catch (err) {
      console.error("OFX import failed", err);
      setError(Lang.timeline.importOfxError);
    } finally {
      setIsImporting(false);
    }
  };

  const importAccounts = async (
    entries: ParsedOfxTransaction[],
    accountId: string,
    sourceFile: string
  ) => {
    const { accountTransactions: accountRegistries } = getRepositories();

    const registries = entries.map(
      ({ amount, date, description, fitId }): AccountsRegistry => {
        const value = Math.round(amount * 100) / 100;
        const importMeta = JSON.stringify({
          source: "ofx",
          fileName: sourceFile,
          fitId: fitId ?? null,
        });

        return new AccountsRegistry(
          crypto.randomUUID(),
          RegistryType.ACCOUNT,
          accountId,
          value,
          description,
          date,
          true,
          [],
          undefined,
          undefined,
          importMeta
        );
      }
    );

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

  const status = (() => {
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
  })();

  const handleClose = () => {
    setTransactions([]);
    resetFileInput();
    setError(null);
    setFileName("");
    onClose();
  };

  const selectedCard = selectedCardId
    ? creditCards.find((card) => card.id === selectedCardId)
    : undefined;

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
      <div className="TimelineOfxImport">
        <div className="TimelineOfxImport__header">
          <h2 className="TimelineOfxImport__title">{Lang.timeline.importOfxTitle}</h2>
          <button
            type="button"
            className="TimelineOfxImport__close"
            onClick={handleClose}
            aria-label={Lang.commons.cancel}
          >
            <Icon icon={Icon.all.faClose} />
          </button>
        </div>

        <div className="TimelineOfxImport__type">
          <label>
            <input
              type="radio"
              name="ofxImportType"
              value="account"
              checked={importType === "account"}
              onChange={() => setImportType("account")}
            />{" "}
            {Lang.timeline.importOfxAccountOption}
          </label>
          <label>
            <input
              type="radio"
              name="ofxImportType"
              value="credit"
              checked={importType === "credit"}
              onChange={() => setImportType("credit")}
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
                onChange={(event) => setSelectedAccountId(event.target.value || undefined)}
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
                onChange={(event) => setSelectedCardId(event.target.value || undefined)}
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
              key={fileInputKey}
              type="file"
              accept=".ofx"
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
    </Dialog>
  );
};

export default TimelineOfxImport;
