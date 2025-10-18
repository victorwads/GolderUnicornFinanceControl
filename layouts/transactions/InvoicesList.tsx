import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { MicButton } from "@components/MicButton";
import { TabBar } from "@components/TabBar";
import { TransactionItem } from "@components/TransactionItem";
import { MonthYearPicker } from "@components/ui/month-year-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";

export default function InvoicesList({
  model: {
    navigate,
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
  }
}: {
  model: InvoicesListViewModel
}) {
  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(new ToMoreRoute())}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Faturas</h1>
                <p className="text-sm text-muted-foreground">Cartão Nubank</p>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Visualização</h4>
                  <Tabs value={filterView} onValueChange={(v) => setFilterView(v as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="all" className="text-xs">Tudo</TabsTrigger>
                      <TabsTrigger value="recurring" className="text-xs">Recorrente</TabsTrigger>
                    </TabsList>
                    <TabsList className="grid w-full grid-cols-2 mt-1">
                      <TabsTrigger value="installments" className="text-xs">Parcelado</TabsTrigger>
                      <TabsTrigger value="single" className="text-xs">Avulso</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Navigation tabs */}
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <div className="flex items-center overflow-x-auto hide-scrollbar px-4 pb-3">
              {monthTabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={selectedMonth === tab.value ? "default" : "ghost"}
                  size="sm"
                  className="flex-shrink-0 mx-1"
                  onClick={() => {
                    if (selectedMonth === tab.value) {
                      setPickerOpen(true);
                    } else {
                      setSelectedMonth(tab.value);
                    }
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Invoice info card */}
          <Card className="m-4 p-4 bg-gradient-card border-border/50">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">Fatura Atual</h3>
                  {currentInvoice.isClosed ? (
                    <Badge variant="secondary">Fechada</Badge>
                  ) : (
                    <Badge variant="outline" className="border-primary text-primary">Aberta</Badge>
                  )}
                  {currentInvoice.isPaid && (
                    <Badge variant="default" className="bg-success">Paga</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Fecha em: <span className="text-foreground font-medium">{currentInvoice.closeDate}</span></p>
                  <p>Vence em: <span className="text-foreground font-medium">{currentInvoice.dueDate}</span></p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-2xl font-bold text-destructive">
                  R$ {currentInvoice.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>
        </header>

        {/* Transactions list */}
        <div className="p-4 space-y-6 animate-fade-in">
          {filterView === "all" && groupedTransactions ? (
            <>
              {groupedTransactions.recurring.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    Recorrentes ({groupedTransactions.recurring.length})
                  </h3>
                  <div className="space-y-2">
                    {groupedTransactions.recurring.map((transaction) => (
                      <TransactionItem key={transaction.id} {...transaction} />
                    ))}
                  </div>
                </section>
              )}
              {groupedTransactions.installments.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    Parcelados ({groupedTransactions.installments.length})
                  </h3>
                  <div className="space-y-2">
                    {groupedTransactions.installments.map((transaction) => (
                      <TransactionItem key={transaction.id} {...transaction} />
                    ))}
                  </div>
                </section>
              )}
              {groupedTransactions.single.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    Avulsos ({groupedTransactions.single.length})
                  </h3>
                  <div className="space-y-2">
                    {groupedTransactions.single.map((transaction) => (
                      <TransactionItem key={transaction.id} {...transaction} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} {...transaction} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <button className="hidden" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <MonthYearPicker
            value={selectedMonth}
            onChange={(value) => {
              setSelectedMonth(value);
              setPickerOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <MicButton />
      <TabBar />
    </div>
  );
}

// Navigation Routes
export class InvoicesListRoute {}

export class ToMoreRoute extends InvoicesListRoute {}

export interface Transaction {
  id: number;
  title: string;
  category: string;
  amount: number;
  date: string;
  originalDate?: string;
  type: "expense" | "income";
  transactionType?: "recurring" | "credit" | "debit" | "invoice" | "transfer";
  installmentInfo?: string;
  tags?: string[];
  account: string;
}

export interface Invoice {
  monthYear: string;
  closeDate: string;
  dueDate: string;
  isClosed: boolean;
  isPaid: boolean;
  totalAmount: number;
  transactions: Transaction[];
}

export interface InvoicesListViewModel {
  navigate: (route: InvoicesListRoute) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  pickerOpen: boolean;
  setPickerOpen: (open: boolean) => void;
  filterView: "all" | "recurring" | "installments" | "single";
  setFilterView: (view: "all" | "recurring" | "installments" | "single") => void;
  monthTabs: { value: string; label: string }[];
  currentInvoice: Invoice;
  filteredTransactions: Transaction[];
  groupedTransactions: {
    recurring: Transaction[];
    installments: Transaction[];
    single: Transaction[];
  } | null;
  navigateMonth: (direction: "prev" | "next") => void;
}
