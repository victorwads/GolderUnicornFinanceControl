import * as React from "react";
import { cn } from "@lib/utils";
import { Input } from "@components/ui/input";
import { ScrollArea } from "@components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Button } from "@components/ui/button";

export interface IconSearchProps {
  iconList: string[];
  value?: string;
  onChange?: (iconName: string) => void;
  renderIcon: (iconName: string) => React.ReactNode;
  placeholder?: string;
  className?: string;
}

const IconSearch = React.forwardRef<HTMLButtonElement, IconSearchProps>(
  ({ iconList, value, onChange, renderIcon, placeholder = "Selecione um ícone", className }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    const filteredIcons = React.useMemo(() => {
      if (!search) return iconList;
      return iconList.filter(icon => 
        icon.toLowerCase().includes(search.toLowerCase())
      );
    }, [iconList, search]);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            className={cn("w-full justify-start gap-2", className)}
          >
            {value ? (
              <>
                {renderIcon(value)}
                <span>{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 pointer-events-auto" align="start">
          <div className="p-3 border-b">
            <Input
              placeholder="Buscar ícone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ScrollArea className="h-64">
            <div className="grid grid-cols-6 gap-2 p-3">
              {filteredIcons.slice(0, 100).map((iconName) => (
                <button
                  key={iconName}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded border-2 hover:bg-accent transition-colors",
                    value === iconName ? "border-primary bg-accent" : "border-transparent"
                  )}
                  onClick={() => {
                    onChange?.(iconName);
                    setOpen(false);
                  }}
                  title={iconName}
                >
                  {renderIcon(iconName)}
                </button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  }
);
IconSearch.displayName = "IconSearch";

export { IconSearch };
