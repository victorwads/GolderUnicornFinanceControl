import { ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock, ArrowRightLeft, CreditCard, FileText } from "lucide-react";
import { Card } from "@components/ui/card";
import { cn } from "@lib/utils";
import { Badge } from "@components/ui/badge";
import { useState } from "react";
import Icon, { getIconByCaseInsensitiveName } from "@components/Icons";

interface TransactionItemProps {
  title: string;
  category: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  compact?: boolean;
  account?: string;
  isPaid?: boolean;
  transactionType?: "transfer" | "debit" | "recurring" | "credit" | "invoice";
  tags?: string[];
  categoryIconName?: string;
  categoryColor?: string;
  originalDate?: string;
  installmentInfo?: string;
  onClick?: () => void;
}


const transactionTypeConfig: Record<string, { icon: any; label: string }> = {
  "transfer": { icon: ArrowRightLeft, label: "Transferência" },
  "debit": { icon: CreditCard, label: "Débito" },
  "recurring": { icon: Clock, label: "Recorrente" },
  "credit": { icon: CreditCard, label: "Crédito" },
  "invoice": { icon: FileText, label: "Fatura" },
};

export const TransactionItem = ({ 
  title, 
  category, 
  amount, 
  date, 
  type,
  compact = false,
  account,
  isPaid = false,
  transactionType,
  tags = [],
  categoryIconName,
  categoryColor,
  originalDate,
  installmentInfo,
  onClick
}: TransactionItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isIncome = type === "income";
  const resolvedCategoryColor = categoryColor || "#6366f1";
  const categoryIcon = getIconByCaseInsensitiveName(categoryIconName || "question");
  const formattedAmount = Math.abs(amount).toLocaleString(CurrentLangInfo.short, {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
  
  const typeConfig = transactionType ? transactionTypeConfig[transactionType] : null;
  const TypeIcon = typeConfig?.icon;

  // Determina se deve mostrar expandido
  const showExpanded = compact ? isExpanded : true;

  return (
    <Card 
      className="p-4 bg-gradient-card border border-border/50 transition-all duration-300 hover:shadow-md cursor-pointer"
      onClick={() => {
        if (onClick) {
          onClick();
        } else {
          setIsExpanded(!isExpanded);
        }
      }}
    >
      <div className="flex items-center gap-4">
        {/* Bolinha com ícone da categoria */}
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${resolvedCategoryColor}20` }}
        >
          <Icon icon={categoryIcon} className="w-5 h-5" style={{ color: resolvedCategoryColor }} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{title}</h4>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{category}</p>
            {account && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <p className="text-xs text-muted-foreground">{account}</p>
              </>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className={cn(
            "font-bold",
            isIncome ? "text-success" : "text-destructive"
          )}>
            {isIncome ? "+" : "-"} {formattedAmount}
          </p>
          <div className="flex items-center justify-end gap-1">
            <div className="flex flex-col items-end">
              <p className="text-xs text-muted-foreground">{date}</p>
              {originalDate && (
                <p className="text-[10px] text-muted-foreground/60">
                  Compra: {originalDate}
                </p>
              )}
            </div>
            {/* Setinha pequena indicando entrada/saída */}
            {isIncome ? (
              <ArrowDownLeft className="w-3 h-3 text-success" />
            ) : (
              <ArrowUpRight className="w-3 h-3 text-destructive" />
            )}
          </div>
        </div>
      </div>

      {/* Detalhes expandidos */}
      {showExpanded && (account || transactionType || tags.length > 0 || installmentInfo) && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between gap-3">
            {/* Tags à esquerda */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {installmentInfo && (
                <Badge variant="outline" className="text-xs">
                  {installmentInfo}
                </Badge>
              )}
              {tags.length > 0 && tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Ícones à direita */}
            <div className="flex items-center gap-3">
              {isPaid !== undefined && (
                <div className="flex items-center gap-1">
                  {isPaid ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Clock className="h-4 w-4 text-warning" />
                  )}
                </div>
              )}

              {TypeIcon && (
                <TypeIcon className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
