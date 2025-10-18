import * as React from "react";
import { cn } from "@lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";

export interface MonthYearPickerProps {
  value?: string; // YYYY-MM
  onChange?: (value: string) => void;
  className?: string;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const MonthYearPicker = React.forwardRef<HTMLButtonElement, MonthYearPickerProps>(
  ({ value, onChange, className }, ref) => {
    const [open, setOpen] = React.useState(false);
    
    const parseValue = (val?: string) => {
      if (!val) {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
      }
      const [year, month] = val.split("-").map(Number);
      return { year, month: month - 1 };
    };

    const { year: currentYear, month: currentMonth } = parseValue(value);
    const [viewYear, setViewYear] = React.useState(currentYear);

    const handleSelect = (month: number) => {
      const newValue = `${viewYear}-${String(month + 1).padStart(2, "0")}`;
      onChange?.(newValue);
      setOpen(false);
    };

    const formatDisplay = () => {
      if (!value) return "Selecione o mês/ano";
      const { year, month } = parseValue(value);
      return `${MONTHS[month]} ${year}`;
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", className)}
          >
            {formatDisplay()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewYear(viewYear - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="font-semibold">{viewYear}</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewYear(viewYear + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((month, idx) => (
                <Button
                  key={idx}
                  variant={
                    viewYear === currentYear && idx === currentMonth
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  onClick={() => handleSelect(idx)}
                  className="h-9"
                >
                  {month.slice(0, 3)}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
MonthYearPicker.displayName = "MonthYearPicker";

export { MonthYearPicker };
