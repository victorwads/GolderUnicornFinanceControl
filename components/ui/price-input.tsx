import * as React from "react";
import { cn } from "@lib/utils";

export interface PriceInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
  currency?: string;
}

const PriceInput = React.forwardRef<HTMLInputElement, PriceInputProps>(
  ({ className, value = 0, onChange, currency = "R$", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    React.useEffect(() => {
      setDisplayValue(formatCurrency(value));
    }, [value]);

    const formatCurrency = (num: number) => {
      return num.toFixed(2).replace(".", ",");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value.replace(/[^\d]/g, "");
      const numValue = parseInt(input || "0") / 100;
      setDisplayValue(formatCurrency(numValue));
      onChange?.(numValue);
    };

    return (
      <div className="relative flex items-center">
        <span className="absolute left-3 text-muted-foreground pointer-events-none">
          {currency}
        </span>
        <input
          type="text"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background pl-12 pr-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          value={displayValue}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
PriceInput.displayName = "PriceInput";

export { PriceInput };
