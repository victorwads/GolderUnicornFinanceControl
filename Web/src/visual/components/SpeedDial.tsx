import { useState } from "react";
import { Plus, ArrowLeftRight, TrendingUp, TrendingDown, CreditCard, Calendar } from "lucide-react";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { useNavigate } from "react-router-dom";
import { incrementClickCount } from "@components/QuickActions";

const actions = [
  { id: "transfer", icon: ArrowLeftRight, label: "Transferência", color: "bg-blue-600 hover:bg-blue-700", route: "/transfers/create" },
  { id: "income", icon: TrendingUp, label: "Entrada na conta", color: "bg-success hover:bg-success/90", route: "/accounts/income/add" },
  { id: "expense", icon: TrendingDown, label: "Gasto na conta", color: "bg-destructive hover:bg-destructive/90", route: "/accounts/expense/add" },
  { id: "credit-card", icon: CreditCard, label: "Gasto no cartão", color: "bg-orange-600 hover:bg-orange-700", route: "/creditcards/transaction/add" },
  { id: "recurring", icon: Calendar, label: "Nova recorrência", color: "bg-purple-600 hover:bg-purple-700", route: "/recurrents/create" },
];

export const SpeedDial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-[4.5rem] right-6 z-40 flex flex-col items-end">
      {/* Action buttons */}
      <div className="flex flex-col-reverse gap-3 mb-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              className={cn(
                "flex items-center justify-end gap-3 transition-all duration-300",
                isOpen 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-4 pointer-events-none"
              )}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
              }}
            >
              <span className="bg-card border border-border px-3 py-1.5 rounded-lg text-sm font-medium text-foreground whitespace-nowrap shadow-md">
                {action.label}
              </span>
              <Button
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-110",
                  action.color
                )}
                onClick={() => {
                  incrementClickCount(action.id);
                  navigate(action.route);
                  setIsOpen(false);
                }}
              >
                <Icon className="h-5 w-5 text-white" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Main button */}
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          isOpen ? "rotate-45 bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
