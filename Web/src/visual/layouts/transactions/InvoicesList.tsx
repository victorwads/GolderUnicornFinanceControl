import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { TimelineMonthNavigator } from "@components/TimelineMonthNavigator";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { TransactionItem } from "@components/TransactionItem";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@components/ui/tabs";

export default function InvoicesList({
  model: {
    navigate,
    creditCardName,
    filterView,
    setFilterView,
    monthLabel,
    monthRange,
    currentInvoice,
    filteredTransactions,
    groupedTransactions,
    goToPreviousMonth,
    goToNextMonth,
  }
}: {
  model: InvoicesListViewModel
}) {
  const formatCurrency = (value: number) =>
    value.toLocaleString(CurrentLangInfo.short, {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  return (
    <div className="max-w-4xl mx-auto">
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="p-4 grid grid-cols-[auto_1fr_auto] items-center gap-4">
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
              <p className="text-sm text-muted-foreground">{creditCardName}</p>
            </div>
          </div>
          <TimelineMonthNavigator
            monthLabel={monthLabel}
            monthRange={monthRange}
            onPrevious={goToPreviousMonth}
            onNext={goToNextMonth}
            className="justify-self-center"
          />
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
                {formatCurrency(currentInvoice.totalAmount)}
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
  onClick?: () => void;
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
  creditCardName: string;
  filterView: "all" | "recurring" | "installments" | "single";
  setFilterView: (view: "all" | "recurring" | "installments" | "single") => void;
  monthLabel: string;
  monthRange: string;
  currentInvoice: Invoice;
  filteredTransactions: Transaction[];
  groupedTransactions: {
    recurring: Transaction[];
    installments: Transaction[];
    single: Transaction[];
  } | null;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}
