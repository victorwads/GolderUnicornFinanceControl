import { TransactionItem } from "@components/TransactionItem";
import { TabBar } from "@components/TabBar";
import { SpeedDial } from "@components/SpeedDial";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Filter, TrendingUp, TrendingDown, Search, MoreVertical, Download, Upload, Trash2, BarChart3, Rows3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";

interface TimelineProps {
  model: TimelineViewModel;
}

export default function Timeline({ model }: TimelineProps) {
  const { isCompact, setIsCompact, timelineData } = model;

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-7xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-[4px] border-b border-border/50">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Timeline</h1>
                <p className="text-sm text-muted-foreground">Histórico de transações</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setIsCompact(!isCompact)}
                >
                  <Rows3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
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
                    <DropdownMenuItem>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar transações
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Exportar transações
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ver estatísticas
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar histórico
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                className="pl-9 bg-background"
              />
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-3 p-5 bg-gradient-card border border-border/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Receitas</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <p className="text-xl font-bold text-success">R$ 5.800,00</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Despesas</p>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-expense" />
                    <p className="text-xl font-bold text-expense">R$ 3.660,00</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Balanço do mês</p>
                  <p className="text-2xl font-bold text-foreground">R$ 2.140,00</p>
                </div>
              </div>
            </Card>

            <div className="lg:col-span-3 space-y-6">
              {Object.entries(timelineData).map(([period, transactions]) => (
                <section key={period}>
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                    {period}
                  </h2>
                  <div className="space-y-2">
                    {transactions.map((transaction) => (
                      <TransactionItem key={transaction.id} {...transaction} compact={isCompact} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SpeedDial />
      <TabBar />
    </div>
  );
}

export interface Transaction {
  id: number;
  title: string;
  category: string;
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

export interface TimelineViewModel {
  navigate: (path: string) => void;
  isCompact: boolean;
  setIsCompact: (value: boolean) => void;
  timelineData: TimelineData;
}
