import { TransactionItem } from "@components/TransactionItem";
import { SpeedDial } from "@components/SpeedDial";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Filter, TrendingUp, TrendingDown, Search, MoreVertical, Download, Upload, Trash2, BarChart3, Rows3, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@components/ui/dialog";
import { Label } from "@components/ui/label";
import { SelectList, SelectListOption } from "@components/ui/select-list";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Calendar } from "@components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";

interface TimelineProps {
  model: TimelineViewModel;
  embedded?: boolean;
}

export default function Timeline({ model, embedded = false }: TimelineProps) {
  const {
    texts,
    locale,
    navigate,
    isCompact,
    toggleCompact,
    monthLabel,
    monthRange,
    goToPreviousMonth,
    goToNextMonth,
    isSearchOpen,
    toggleSearch,
    timelineData,
    summary,
    searchText,
    setSearchText,
    isFilterModalOpen,
    closeFilters,
    filterAccount,
    setFilterAccount,
    filterSince,
    setFilterSince,
    filterUntil,
    setFilterUntil,
    filterCategories,
    setFilterCategories,
    filterTags,
    setFilterTags,
    accountOptions,
    categoryOptions,
    tagOptions,
    applyFilters,
    clearFilters,
  } = model;

  const content = (
    <div className="p-4 space-y-6 animate-fade-in pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3 p-5 bg-gradient-card border border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{texts.summaryIncomeLabel}</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                {summary === null ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <p className="text-xl font-bold text-success">R$ {summary.income.toLocaleString(locale, { minimumFractionDigits: 2 })}</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{texts.summaryExpenseLabel}</p>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-expense" />
                {summary === null ? (
                  <Skeleton className="h-7 w-28" />
                ) : (
                  <p className="text-xl font-bold text-expense">R$ {summary.expense.toLocaleString(locale, { minimumFractionDigits: 2 })}</p>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-muted-foreground mb-1">{texts.summaryBalanceLabel}</p>
              {summary === null ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-2xl font-bold text-foreground">R$ {summary.balance.toLocaleString(locale, { minimumFractionDigits: 2 })}</p>
              )}
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {timelineData === null ? (
            <div className="space-y-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="space-y-2">
                  <Skeleton className="h-4 w-32 mb-3" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : (
            Object.entries(timelineData).map(([period, transactions]) => (
              <section key={period}>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                  {period}
                </h2>
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <TransactionItem key={transaction.id} {...transaction} compact={isCompact} onClick={() => navigate(new ToEditTransactionRoute(transaction.id, transaction.type, transaction.transactionType))} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn(embedded ? "relative flex h-full min-h-0 flex-col" : "relative mx-auto max-w-7xl")}>
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-[4px] border-b border-border/50">
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 gap-y-2 max-[720px]:grid-cols-[1fr_auto]">
            <h1 className="text-lg font-bold text-foreground shrink-0 justify-self-start">{texts.title}</h1>

            <div className="flex items-center justify-center gap-1 justify-self-center max-[720px]:col-span-2 max-[720px]:row-start-2 max-[720px]:w-full max-[720px]:pt-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center min-w-[140px]">
                <p className="text-sm font-semibold text-foreground leading-tight">{monthLabel}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{monthRange}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 shrink-0 justify-self-end">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", isSearchOpen && "bg-accent")}
                onClick={toggleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", isCompact && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground")}
                onClick={toggleCompact}
                title={texts.compactViewTitle}
              >
                <Rows3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigate(new ToOpenFiltersRoute())}
                title={texts.filtersButtonTitle}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate(new ToImportRoute())}>
                    <Upload className="h-4 w-4 mr-2" />
                    {texts.importTransactionsLabel}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(new ToExportRoute())}>
                    <Download className="h-4 w-4 mr-2" />
                    {texts.exportTransactionsLabel}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(new ToStatisticsRoute())}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {texts.statisticsLabel}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => navigate(new ToClearHistoryRoute())}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {texts.clearHistoryLabel}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {isSearchOpen && (
            <div className="relative animate-fade-in">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={texts.searchPlaceholder}
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="pl-9 bg-background"
                autoFocus
              />
            </div>
          )}
        </div>
      </header>

      {embedded ? (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {content}
        </div>
      ) : content}

      <SpeedDial embedded={embedded} />

      <Dialog open={isFilterModalOpen} onOpenChange={(value) => !value && closeFilters()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{texts.filtersTitle}</DialogTitle>
            <DialogDescription className="sr-only">
              {texts.filtersTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="account">{texts.filtersAccountLabel}</Label>
              <SelectList
                options={accountOptions}
                value={filterAccount}
                onChange={setFilterAccount}
                placeholder={texts.selectAccountPlaceholder}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{texts.filtersSinceLabel}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filterSince && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterSince ? format(filterSince, "dd/MM/yyyy") : texts.selectDatePlaceholder}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterSince}
                      onSelect={setFilterSince}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>{texts.filtersUntilLabel}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filterUntil && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterUntil ? format(filterUntil, "dd/MM/yyyy") : texts.selectDatePlaceholder}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filterUntil}
                      onSelect={setFilterUntil}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label>{texts.filtersCategoriesLabel}</Label>
              <div className="mt-2">
                <SelectList
                  options={categoryOptions}
                  value={filterCategories}
                  onChange={(value) => setFilterCategories(Array.isArray(value) ? value : value ? [value] : [])}
                  placeholder={texts.selectCategoriesPlaceholder}
                  allowSelectHeader={true}
                  multiple={true}
                />
              </div>
            </div>

            <div>
              <Label>{texts.filtersTagsLabel}</Label>
              <div className="mt-2">
                <SelectList
                  options={tagOptions}
                  value={filterTags}
                  onChange={(value) => setFilterTags(Array.isArray(value) ? value : value ? [value] : [])}
                  placeholder={texts.selectTagsPlaceholder}
                  multiple={true}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={clearFilters}>
              {texts.clearFiltersLabel}
            </Button>
            <Button onClick={applyFilters}>
              {texts.applyFiltersLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export interface FilterData {
  account?: string;
  since?: Date;
  until?: Date;
  categories: string[];
}

export interface Transaction {
  id: string;
  title: string;
  category: string;
  categoryIconName?: string;
  categoryColor?: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  account: string;
  isPaid: boolean;
  transactionType: "debit" | "credit" | "recurring" | "invoice" | "transfer" | undefined;
  tags: string[];
}

export interface TimelineData {
  [key: string]: Transaction[];
}

export interface TimelineTexts {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  compactViewTitle: string;
  filtersButtonTitle: string;
  importTransactionsLabel: string;
  exportTransactionsLabel: string;
  statisticsLabel: string;
  clearHistoryLabel: string;
  summaryIncomeLabel: string;
  summaryExpenseLabel: string;
  summaryBalanceLabel: string;
  filtersTitle: string;
  filtersAccountLabel: string;
  filtersSinceLabel: string;
  filtersUntilLabel: string;
  filtersCategoriesLabel: string;
  filtersTagsLabel: string;
  selectAccountPlaceholder: string;
  selectDatePlaceholder: string;
  selectCategoriesPlaceholder: string;
  selectTagsPlaceholder: string;
  clearFiltersLabel: string;
  applyFiltersLabel: string;
}

export interface TimelineViewModel {
  navigate: (route: TimelineRoute) => void;
  texts: TimelineTexts;
  locale: string;
  isCompact: boolean;
  toggleCompact: () => void;
  monthKey: string;
  monthLabel: string;
  monthRange: string;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  timelineData: TimelineData | null;
  summary: { income: number; expense: number; balance: number } | null;
  searchText: string;
  setSearchText: (value: string) => void;
  isFilterModalOpen: boolean;
  closeFilters: () => void;
  filterAccount: string;
  setFilterAccount: (value: string) => void;
  filterSince?: Date;
  setFilterSince: (value?: Date) => void;
  filterUntil?: Date;
  setFilterUntil: (value?: Date) => void;
  filterCategories: string[];
  setFilterCategories: (value: string[]) => void;
  filterTags: string[];
  setFilterTags: (value: string[]) => void;
  accountOptions: SelectListOption[];
  categoryOptions: SelectListOption[];
  tagOptions: SelectListOption[];
  applyFilters: () => void;
  clearFilters: () => void;
}

export class TimelineRoute {}
export class ToOpenFiltersRoute extends TimelineRoute {}
export class ToImportRoute extends TimelineRoute {}
export class ToExportRoute extends TimelineRoute {}
export class ToStatisticsRoute extends TimelineRoute {}
export class ToClearHistoryRoute extends TimelineRoute {}
export class ToEditTransactionRoute extends TimelineRoute {
  constructor(
    public readonly transactionId: string,
    public readonly type: "income" | "expense",
    public readonly transactionType: "debit" | "credit" | "recurring" | "invoice" | "transfer" | undefined
  ) {
    super();
  }
}
