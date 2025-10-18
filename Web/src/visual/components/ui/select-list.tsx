import * as React from "react";
import { cn } from "@lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import { Button } from "@components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@components/ui/command";
import Icon, { IconDefinition, getIconByCaseInsensitiveName } from "@components/Icons";

export interface SelectListOption {
  label: string;
  value: string;
  iconUrl?: string;
  iconName?: string;
  iconInstance?: IconDefinition;
  backgroundColor?: string;
  subOptions?: SelectListOption[];
}

export interface SelectListProps {
  options: SelectListOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  allowSelectHeader?: boolean;
  className?: string;
}

const SelectList = React.forwardRef<HTMLButtonElement, SelectListProps>(
  ({ options, value, onChange, placeholder = "Selecione...", allowSelectHeader = true, className }, ref) => {
    const [open, setOpen] = React.useState(false);
    
    const findOption = (opts: SelectListOption[], val: string): SelectListOption | undefined => {
      for (const opt of opts) {
        if (opt.value === val) return opt;
        if (opt.subOptions) {
          const found = findOption(opt.subOptions, val);
          if (found) return found;
        }
      }
      return undefined;
    };

    const selectedOption = value ? findOption(options, value) : undefined;

    const renderIcon = (option: SelectListOption) => {
      const bgColor = option.backgroundColor || "hsl(var(--muted))";
      
      if (option.iconUrl) {
        return (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            <img src={option.iconUrl} alt="" className="w-5 h-5 object-contain" />
          </div>
        );
      }
      
      if (option.iconInstance) {
        return (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: bgColor }}
          >
            <Icon icon={option.iconInstance} className="w-4 h-4" />
          </div>
        );
      }
      
      if (option.iconName) {
        const iconDef = getIconByCaseInsensitiveName(option.iconName);
        return (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: bgColor }}
          >
            <Icon icon={iconDef} className="w-4 h-4" />
          </div>
        );
      }
      
      return null;
    };

    const renderOptions = (opts: SelectListOption[], level = 0) => {
      return opts.map((option) => (
        <React.Fragment key={option.value}>
          <CommandItem
            value={option.value}
            onSelect={() => {
              if (allowSelectHeader || !option.subOptions) {
                onChange?.(option.value);
                setOpen(false);
              }
            }}
            className={cn(
              "flex items-center gap-3",
              level > 0 && "pl-12",
              !allowSelectHeader && option.subOptions && "opacity-60 cursor-not-allowed"
            )}
            disabled={!allowSelectHeader && !!option.subOptions}
          >
            {renderIcon(option)}
            <span className="flex-1">{option.label}</span>
            {value === option.value && <Check className="h-4 w-4" />}
          </CommandItem>
          {option.subOptions && renderOptions(option.subOptions, level + 1)}
        </React.Fragment>
      ));
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
          >
            {selectedOption ? (
              <div className="flex items-center gap-3">
                {renderIcon(selectedOption)}
                <span>{selectedOption.label}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar..." />
            <CommandList>
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              <CommandGroup>
                {renderOptions(options)}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
SelectList.displayName = "SelectList";

export { SelectList };
