import { TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Card } from "@components/ui/card";
import { cn } from "@lib/utils";

interface BalanceCardProps {
  accountsCount: number;
}

export const BalanceCard = ({ accountsCount }: BalanceCardProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const balance = 12450.80;
  const change = 8.5;
  const isPositive = change >= 0;

  return (
    <Card className="bg-gradient-primary text-white p-5 shadow-lg border-0 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-sm font-medium">Saldo Total</span>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="text-white/80 hover:text-white transition-colors p-1"
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        <div className="mb-2">
          {isVisible ? (
            <h2 className="text-3xl font-bold tracking-tight">
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          ) : (
            <div className="flex gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-white/40" />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isPositive ? "text-emerald-200" : "text-red-200"
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{isPositive ? '+' : ''}{change}% este mês</span>
          </div>

          <p className="text-xs text-white/60 text-right">
            {accountsCount} contas • {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </Card>
  );
};
