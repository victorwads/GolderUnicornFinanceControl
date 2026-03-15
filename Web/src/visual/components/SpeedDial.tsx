import { useState } from "react";
import { Plus, ArrowLeftRight, TrendingUp, TrendingDown, CreditCard, Calendar } from "lucide-react";
import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { incrementClickCount } from "@components/QuickActions";

const actions = [
  { id: "transfer", icon: ArrowLeftRight, getLabel: () => Lang.visual.home.quickActionTransfer, color: "bg-blue-600 hover:bg-blue-700", path: "/timeline/entry/transfer/create" },
  { id: "income", icon: TrendingUp, getLabel: () => Lang.visual.home.quickActionIncome, color: "bg-success hover:bg-success/90", path: "/timeline/entry/account/income/create" },
  { id: "expense", icon: TrendingDown, getLabel: () => Lang.visual.home.quickActionExpense, color: "bg-destructive hover:bg-destructive/90", path: "/timeline/entry/account/expense/create" },
  { id: "credit-card", icon: CreditCard, getLabel: () => Lang.visual.home.quickActionCreditCard, color: "bg-orange-600 hover:bg-orange-700", path: "/timeline/entry/credit/create" },
  { id: "recurring", icon: Calendar, getLabel: () => Lang.visual.home.quickActionRecurring, color: "bg-purple-600 hover:bg-purple-700", path: "/recurrents/create" },
];

export const SpeedDial = ({ embedded = false }: { embedded?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.pathname.startsWith("/timeline") ? location.search : "";

  return (
    <div className={cn(
      "z-40",
      embedded ? "pointer-events-none absolute inset-0" : "fixed bottom-[4.5rem] right-6 flex flex-col items-end"
    )}>
      <div className={cn(
        "flex flex-col-reverse gap-3 mb-3",
        embedded && "pointer-events-auto absolute bottom-6 right-6 items-end"
      )}>
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
                {action.getLabel()}
              </span>
              <Button
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-110",
                  action.color
                )}
                onClick={() => {
                  incrementClickCount(action.id);
                  navigate(`${action.path}${search}`);
                  setIsOpen(false);
                }}
              >
                <Icon className="h-5 w-5 text-white" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          embedded && "pointer-events-auto",
          isOpen ? "rotate-45 bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
        )}
        style={embedded ? { position: "absolute", right: "1.5rem", bottom: "1.5rem" } : undefined}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="h-6 w-6 text-white" />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className={cn(
            "-z-10 bg-background/80 backdrop-blur-sm animate-fade-in",
            embedded ? "pointer-events-auto absolute inset-0" : "fixed inset-0"
          )}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
