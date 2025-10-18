import * as React from "react";
import { cn } from "@lib/utils";
import { X } from "lucide-react";
import { Badge } from "@components/ui/badge";

export interface TagsInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string[];
  onChange?: (tags: string[]) => void;
}

const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(
  ({ className, value = [], onChange, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const trimmed = inputValue.trim();
        if (trimmed && !value.includes(trimmed)) {
          onChange?.([...value, trimmed]);
          setInputValue("");
        }
      } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        onChange?.(value.slice(0, -1));
      }
    };

    const removeTag = (tagToRemove: string) => {
      onChange?.(value.filter(tag => tag !== tagToRemove));
    };

    return (
      <div
        className={cn(
          "flex min-h-10 w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className
        )}
      >
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:bg-accent rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground"
          {...props}
        />
      </div>
    );
  }
);
TagsInput.displayName = "TagsInput";

export { TagsInput };
