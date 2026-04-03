import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@components/ui/button";
import { cn } from "@lib/utils";

interface TimelineMonthNavigatorProps {
  monthLabel: string;
  monthRange: string;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

export function TimelineMonthNavigator({
  monthLabel,
  monthRange,
  onPrevious,
  onNext,
  className,
}: TimelineMonthNavigatorProps) {
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="text-center min-w-[140px]">
        <p className="text-sm font-semibold text-foreground leading-tight">{monthLabel}</p>
        <p className="text-[11px] text-muted-foreground leading-tight">{monthRange}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
