import { Upload, ArrowLeft, FileText, CreditCard, Landmark, TrendingUp, TrendingDown, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { ChangeEvent, RefObject, useState } from "react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { Badge } from "@components/ui/badge";
import { TransactionItem } from "@components/TransactionItem";
import { cn } from "@lib/utils";
import { SelectList } from "@components/ui/select-list";
import { Checkbox } from "@components/ui/checkbox";
import { LoaderCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";

export default function TimelineImport({ model }: { model: TimelineImportViewModel }) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const {
    goBack,
    importType,
    setImportType,
    accountOptions,
    selectedAccountId,
    setSelectedAccountId,
    cardOptions,
    selectedCardId,
    setSelectedCardId,
    fileName,
    openFilePicker,
    onFileInputChange,
    fileInputRef,
    isLoadingFile,
    isImporting,
    error,
    status,
    previewItems,
    previewIncome,
    previewExpense,
    selectedCount,
    totalCount,
    selectedWarningCount,
    importTransactions,
    togglePreviewItem,
    hasPreview,
    formatAmount,
  } = model;

  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="h-full min-h-0 bg-background">
      <div className="mx-auto flex h-full max-w-7xl min-h-0 flex-col px-4 py-4 lg:px-6">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{Lang.timeline.importOfxTitle}</h1>
                <p className="text-xs text-muted-foreground">{Lang.timeline.importOfxFileLabel}</p>
              </div>
            </div>
            <Badge variant="outline">OFX</Badge>
          </div>
        </header>

        <div className={cn("grid min-h-0 flex-1 gap-4 pt-4", hasPreview ? "lg:grid-cols-[minmax(360px,40%)_minmax(0,60%)]" : "grid-cols-1")}>
          <section className="min-h-0 overflow-y-auto overscroll-contain">
            <Card className="border-border/60 bg-gradient-card p-5">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>{Lang.timeline.importOfx}</Label>
                  <RadioGroup
                    value={importType}
                    onValueChange={(value) => setImportType(value as "account" | "credit")}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                  >
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
                      <RadioGroupItem value="account" id="import-account" />
                      <Landmark className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{Lang.timeline.importOfxAccountOption}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-3 py-2">
                      <RadioGroupItem value="credit" id="import-credit" />
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{Lang.timeline.importOfxCreditOption}</span>
                    </label>
                  </RadioGroup>
                </div>

                {importType === "account" ? (
                  <div className="space-y-2">
                    <Label>{Lang.timeline.importOfxAccountLabel}</Label>
                    <SelectList
                      options={accountOptions.map((account) => ({
                        value: account.id,
                        label: account.name,
                        iconUrl: account.iconUrl,
                        backgroundColor: account.backgroundColor,
                      }))}
                      value={selectedAccountId}
                      onChange={(value) => setSelectedAccountId(String(value))}
                      placeholder={Lang.commons.selectOption(Lang.timeline.importOfxAccountLabel)}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>{Lang.timeline.importOfxCardLabel}</Label>
                    <SelectList
                      options={cardOptions.map((card) => ({
                        value: card.id,
                        label: card.name,
                        iconUrl: card.iconUrl,
                        backgroundColor: card.backgroundColor,
                      }))}
                      value={selectedCardId}
                      onChange={(value) => setSelectedCardId(String(value))}
                      placeholder={Lang.commons.selectOption(Lang.timeline.importOfxCardLabel)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>{Lang.timeline.importOfxFileLabel}</Label>
                  <div className="flex gap-2">
                    <Input value={fileName} readOnly placeholder=".ofx" className="bg-background" />
                    <Button type="button" variant="outline" onClick={openFilePicker} disabled={isLoadingFile || isImporting}>
                      <Upload className="mr-2 h-4 w-4" />
                      {Lang.commons.select}
                    </Button>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".ofx" className="hidden" onChange={onFileInputChange} />
                </div>

                {status && (
                  <p className={cn("text-sm", error ? "text-destructive" : "text-muted-foreground")}>{status}</p>
                )}
                {isLoadingFile && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>{Lang.commons.loading}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={goBack} disabled={isImporting}>
                    {Lang.commons.cancel}
                  </Button>
                  <Button type="button" className="flex-1" onClick={importTransactions} disabled={!hasPreview || isImporting || isLoadingFile}>
                    {isImporting ? Lang.commons.loading : Lang.timeline.importOfxImport}
                  </Button>
                </div>
              </div>
            </Card>
          </section>

          {hasPreview && (
            <section className="min-h-0 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
              <div className="flex h-full min-h-0 flex-col">
                <div className="border-b border-border/60 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-foreground">
                      {selectedCount}/{totalCount} selecionados para importar
                    </h2>
                    {selectedWarningCount > 0 && (
                      <Badge variant="outline" className="border-warning/50 text-warning">
                        {selectedWarningCount} aviso(s)
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {previewIncome > 0 && (
                      <Card className="border border-border/50 bg-gradient-card p-3">
                        <p className="mb-1 text-xs text-muted-foreground">{Lang.timeline.summaryIncomeLabel}</p>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-success" />
                          <p className="text-base font-bold text-success">{formatAmount(previewIncome)}</p>
                        </div>
                      </Card>
                    )}
                    {previewExpense > 0 && (
                      <Card className="border border-border/50 bg-gradient-card p-3">
                        <p className="mb-1 text-xs text-muted-foreground">{Lang.timeline.summaryExpenseLabel}</p>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-expense" />
                          <p className="text-base font-bold text-expense">{formatAmount(previewExpense)}</p>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
                  {previewItems.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-start gap-2">
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => togglePreviewItem(item.id)}
                        className="mt-4"
                      />
                      {item.duplicateState !== "none" && item.duplicateReason && (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="mt-3 flex items-center gap-1 rounded-md px-1 py-1 hover:bg-muted"
                                onClick={() => toggleExpanded(item.id)}
                              >
                                {item.duplicateState === "blocked" ? <Info className="h-4 w-4 text-destructive" /> : <AlertTriangle className="h-4 w-4 text-warning" />}
                                {expandedIds[item.id] ? (
                                  <ChevronUp className="h-3 w-3 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-72">
                              {item.duplicateReason}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <div className={cn("relative flex-1 transition-all", !item.selected && "opacity-40 saturate-50")}>
                        <TransactionItem
                          title={item.title}
                          category={item.category}
                          amount={item.amount}
                          date={item.dateLabel}
                          type={item.type}
                          transactionType={item.transactionType}
                          account={item.account}
                          compact
                        />
                        {!item.selected && (
                          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                            <div className="absolute left-[-18%] top-1/2 h-[2px] w-[140%] -rotate-12 bg-destructive/60" />
                          </div>
                        )}
                      </div>
                      </div>
                      {item.duplicateState !== "none" && item.duplicateMatched && expandedIds[item.id] && (
                        <div className="ml-8 rounded-xl border border-border/60 bg-muted/20 p-2">
                          <TransactionItem
                            title={item.duplicateMatched.description}
                            category={item.duplicateMatched.category}
                            amount={item.duplicateMatched.value}
                            date={item.duplicateMatched.dateLabel}
                            type={item.duplicateMatched.type}
                            tags={item.duplicateMatched.tags}
                            compact
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

interface TimelineImportItemPreview {
  id: string;
  title: string;
  category: string;
  amount: number;
  dateLabel: string;
  type: "income" | "expense";
  transactionType: "debit" | "credit";
  account?: string;
  selected: boolean;
  duplicateState: "none" | "warning" | "blocked";
  duplicateReason?: string;
  duplicateMatched?: {
    id?: string;
    description: string;
    value: number;
    date: Date;
    category: string;
    dateLabel: string;
    type: "income" | "expense";
    tags?: string[];
  };
}

export interface TimelineImportViewModel {
  goBack: () => void;
  importType: "account" | "credit";
  setImportType: (type: "account" | "credit") => void;
  accountOptions: Array<{ id: string; name: string; iconUrl?: string; backgroundColor?: string }>;
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  cardOptions: Array<{ id: string; name: string; iconUrl?: string; backgroundColor?: string }>;
  selectedCardId: string;
  setSelectedCardId: (id: string) => void;
  fileName: string;
  openFilePicker: () => void;
  onFileInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isLoadingFile: boolean;
  isImporting: boolean;
  error: string | null;
  status: string | null;
  previewItems: TimelineImportItemPreview[];
  previewIncome: number;
  previewExpense: number;
  selectedCount: number;
  totalCount: number;
  selectedWarningCount: number;
  importTransactions: () => Promise<void>;
  togglePreviewItem: (previewId: string) => void;
  hasPreview: boolean;
  formatAmount: (value: number) => string;
}
