import { ArrowLeftRight, TrendingUp, TrendingDown, CreditCard, Calendar, DollarSign } from "lucide-react";
import { Card } from "@components/ui/card";
import { ScrollArea, ScrollBar } from "@components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface Action {
  id: string;
  icon: any;
  label: string;
  color: string;
  route: string;
}

const allActions: Action[] = [
  { id: "transfer", icon: ArrowLeftRight, label: "Transferência", color: "text-blue-600", route: "/transfers/create" },
  { id: "income", icon: TrendingUp, label: "Entrada na conta", color: "text-success", route: "/accounts/income/add" },
  { id: "expense", icon: TrendingDown, label: "Gasto na conta", color: "text-destructive", route: "/accounts/expense/add" },
  { id: "credit-card", icon: CreditCard, label: "Gasto no cartão", color: "text-orange-600", route: "/creditcards/transaction/add" },
  { id: "recurring", icon: Calendar, label: "Nova recorrência", color: "text-purple-600", route: "/recurrents/create" },
  { id: "pay", icon: DollarSign, label: "Pagar", color: "text-warning", route: "/pay" },
];

const CLICKS_STORAGE_KEY = "quick-actions-clicks";

const getClickCounts = (): Record<string, number> => {
  const stored = localStorage.getItem(CLICKS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

const incrementClickCount = (actionId: string) => {
  const counts = getClickCounts();
  counts[actionId] = (counts[actionId] || 0) + 1;
  localStorage.setItem(CLICKS_STORAGE_KEY, JSON.stringify(counts));
};

export const QuickActions = () => {
  const navigate = useNavigate();
  const [sortedActions, setSortedActions] = useState<Action[]>(allActions);

  useEffect(() => {
    const counts = getClickCounts();
    const sorted = [...allActions].sort((a, b) => {
      const countA = counts[a.id] || 0;
      const countB = counts[b.id] || 0;
      return countB - countA;
    });
    setSortedActions(sorted);
  }, []);

  const handleActionClick = (action: Action) => {
    incrementClickCount(action.id);
    navigate(action.route);
  };

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-3 pb-2">
        {sortedActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              onClick={() => handleActionClick(action)}
              className="p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 hover:shadow-md active:scale-95 bg-gradient-card border border-border/50 min-w-[90px] flex-shrink-0"
            >
              <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center ${action.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-foreground text-center whitespace-nowrap">{action.label}</span>
            </Card>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export { incrementClickCount };
