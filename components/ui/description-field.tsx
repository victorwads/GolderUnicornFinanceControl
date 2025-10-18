import * as React from "react";
import { cn } from "@lib/utils";
import { Label } from "@components/ui/label";

export interface DescriptionFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

const DescriptionField = React.forwardRef<HTMLDivElement, DescriptionFieldProps>(
  ({ label, description, children, htmlFor, className }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        <div className="space-y-1">
          <Label htmlFor={htmlFor}>{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
    );
  }
);
DescriptionField.displayName = "DescriptionField";

export { DescriptionField };
