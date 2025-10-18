import { Button } from "@components/ui/button";
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { MicButton } from "@components/MicButton";
import { TabBar } from "@components/TabBar";
import { TransactionItem } from "@components/TransactionItem";

export default function RecurrentsList({
  model: {
    navigate,
    recurrents,
    incomes,
    expenses,
  }
}: {
  model: RecurrentsListViewModel
}) {
  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(new ToMoreRoute())}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Recorrentes</h1>
                <p className="text-sm text-muted-foreground">{recurrents.length} lançamentos cadastrados</p>
              </div>
            </div>
            <Button
              size="icon"
              onClick={() => navigate(new ToCreateRecurrentRoute())}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          {/* Receitas Recorrentes */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Receitas ({incomes.length})
              </h2>
            </div>
            <div className="space-y-2">
              {incomes.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => navigate(new ToEditRecurrentRoute(item.id.toString()))}
                >
                  <TransactionItem
                    title={item.title}
                    category={item.category}
                    amount={item.amount}
                    date={item.nextDate}
                    type={item.type}
                    account={item.account}
                    transactionType="recurring"
                    tags={item.tags}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Despesas Recorrentes */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Despesas ({expenses.length})
              </h2>
            </div>
            <div className="space-y-2">
              {expenses.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => navigate(new ToEditRecurrentRoute(item.id.toString()))}
                >
                  <TransactionItem
                    title={item.title}
                    category={item.category}
                    amount={item.amount}
                    date={item.nextDate}
                    type={item.type}
                    account={item.account}
                    transactionType="recurring"
                    tags={item.tags}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <MicButton />
      <TabBar />
    </div>
  );
}

export interface Recurrent {
  id: number;
  title: string;
  amount: number;
  type: "income" | "expense";
  frequency: string;
  nextDate: string;
  category: string;
  account: string;
  tags?: string[];
}

export interface RecurrentsListViewModel {
  navigate: (route: RecurrentsRoute) => void;
  recurrents: Recurrent[];
  incomes: Recurrent[];
  expenses: Recurrent[];
}

// Navigation Routes
export class RecurrentsRoute {}

export class ToMoreRoute extends RecurrentsRoute {}
export class ToCreateRecurrentRoute extends RecurrentsRoute {}
export class ToEditRecurrentRoute extends RecurrentsRoute {
  constructor(public recurrentId: string) { super() }
}
