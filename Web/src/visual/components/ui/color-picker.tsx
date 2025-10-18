import * as React from "react";
import { cn } from "@lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Button } from "@components/ui/button";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#64748b"
];

export interface ColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const ColorPicker = React.forwardRef<HTMLButtonElement, ColorPickerProps>(
  ({ value = "#3b82f6", onChange, className }, ref) => {
    const [open, setOpen] = React.useState(false);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            className={cn("w-full justify-start gap-2", className)}
          >
            <div
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: value }}
            />
            <span>{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3 pointer-events-auto" align="start">
          <div className="grid grid-cols-6 gap-2 mb-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className={cn(
                  "w-8 h-8 rounded border-2 hover:scale-110 transition-transform",
                  value === color ? "border-primary" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                onClick={() => {
                  onChange?.(color);
                  setOpen(false);
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className="w-12 h-8 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className="flex-1 h-8 px-2 rounded border bg-background text-sm"
            />
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
ColorPicker.displayName = "ColorPicker";

export { ColorPicker };
