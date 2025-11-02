import { TransactionItem } from "@components/TransactionItem";
import { TabBar } from "@components/TabBar";
import { SpeedDial } from "@components/SpeedDial";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Filter, TrendingUp, TrendingDown, Search, MoreVertical, Download, Upload, Trash2, BarChart3, Rows3 } from "lucide-react";
import { Skeleton } from "@components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@components/ui/dialog";
import { Label } from "@components/ui/label";
import { SelectList, SelectListOption } from "@components/ui/select-list";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Calendar } from "@components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@lib/utils";
import { useState } from "react";
import { categories } from "../../../data/categories";
import { Icons } from "@components/Icons";
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
  const { isCompact, setIsCompact, timelineData, summary, isFilterModalOpen, setIsFilterModalOpen, handleFilter, handleClearFilters } = model;
  
  const accountOptions: SelectListOption[] = [
    { label: "Nubank", value: "nubank", iconName: "piggy-bank", backgroundColor: "#8A05BE" },
    { label: "Inter", value: "inter", iconInstance: Icons.faLandmark, backgroundColor: "#FF7A00" },
    { label: "Itaú", value: "itau", iconInstance: Icons.faLandmark, backgroundColor: "#EC7000" },
  ];

  const [filterAccount, setFilterAccount] = useState<string>("");
  const [filterSince, setFilterSince] = useState<Date>();
  const [filterUntil, setFilterUntil] = useState<Date>();
  const [filterCategories, setFilterCategories] = useState<string[]>([]);

  const handleApplyFilter = () => {
    handleFilter({
      account: filterAccount,
      since: filterSince,
      until: filterUntil,
      categories: filterCategories,
    });
  };

  const handleClearFilterForm = () => {
    setFilterAccount("");
    setFilterSince(undefined);
    setFilterUntil(undefined);
    setFilterCategories([]);
    handleClearFilters();
  };

  const toggleCategory = (categoryValue: string) => {
    setFilterCategories(prev => 
      prev.includes(categoryValue)
        ? prev.filter(c => c !== categoryValue)
        : [...prev, categoryValue]
    );
  };

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
                  className={cn("h-9 w-9", isCompact && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground")}
                  onClick={() => setIsCompact(!isCompact)}
                  title="Alternar visualização compacta"
                >
                  <Rows3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setIsFilterModalOpen(true)}
                  title="Filtros"
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
                    {summary === null ? (
                      <Skeleton className="h-7 w-28" />
                    ) : (
                      <p className="text-xl font-bold text-success">R$ {summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Despesas</p>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-expense" />
                    {summary === null ? (
                      <Skeleton className="h-7 w-28" />
                    ) : (
                      <p className="text-xl font-bold text-expense">R$ {summary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Balanço do mês</p>
                  {summary === null ? (
                    <Skeleton className="h-8 w-32" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  )}
                </div>
              </div>
            </Card>

            <div className="lg:col-span-3 space-y-6">
              {timelineData === null ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
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
                        <TransactionItem key={transaction.id} {...transaction} compact={isCompact} />
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filtros</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="account">Conta</Label>
              <SelectList
                options={accountOptions}
                value={filterAccount}
                onChange={setFilterAccount}
                placeholder="Selecione uma conta"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Desde</Label>
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
                      {filterSince ? format(filterSince, "dd/MM/yyyy") : "Selecione"}
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
                <Label>Até</Label>
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
                      {filterUntil ? format(filterUntil, "dd/MM/yyyy") : "Selecione"}
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
              <Label>Categorias</Label>
              <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                {categories.map((category) => (
                  <div key={category.value}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.value)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        filterCategories.includes(category.value)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: category.backgroundColor }}
                      >
                        <span className="text-white text-xs">
                          {category.iconName && <span>📦</span>}
                        </span>
                      </div>
                      <span className="text-left flex-1">{category.label}</span>
                      {filterCategories.includes(category.value) && <X className="h-4 w-4" />}
                    </button>
                    {category.subOptions && filterCategories.includes(category.value) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {category.subOptions.map((sub) => (
                          <button
                            key={sub.value}
                            type="button"
                            onClick={() => toggleCategory(sub.value)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-xs transition-colors",
                              filterCategories.includes(sub.value)
                                ? "bg-primary/80 text-primary-foreground"
                                : "hover:bg-accent"
                            )}
                          >
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: sub.backgroundColor }}
                            >
                              <span className="text-white text-xs">
                                {sub.iconName && <span>📦</span>}
                              </span>
                            </div>
                            <span className="text-left flex-1">{sub.label}</span>
                            {filterCategories.includes(sub.value) && <X className="h-3 w-3" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {filterCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filterCategories.map((catValue) => {
                    const cat = categories.find(c => c.value === catValue) || 
                               categories.flatMap(c => c.subOptions || []).find(s => s.value === catValue);
                    return (
                      <div key={catValue} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        {cat?.label}
                        <button onClick={() => toggleCategory(catValue)} className="hover:text-primary-foreground">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClearFilterForm}>
              Limpar
            </Button>
            <Button onClick={handleApplyFilter}>
              Filtrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SpeedDial />
      <TabBar />
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
  timelineData: TimelineData | null;
  summary: { income: number; expense: number; balance: number } | null;
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (value: boolean) => void;
  handleFilter: (filters: FilterData) => void;
  handleClearFilters: () => void;
}
