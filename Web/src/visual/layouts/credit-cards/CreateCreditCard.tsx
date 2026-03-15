import { UseFormRegister, UseFormHandleSubmit, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { PriceInput } from "@components/ui/price-input";
import { SelectList, SelectListOption } from "@components/ui/select-list";
import { DescriptionField } from "@components/ui/description-field";
import { useIsLandscapeLayout } from "@hooks/use-mobile";
import { cn } from "@lib/utils";

export default function CreateCreditCard({
  model: {
    navigate,
    isEdit,
    register,
    handleSubmit,
    setValue,
    watch,
    onSubmit,
    brands,
    accounts,
  }
}: {
  model: CreditCardViewModel
}) {
  const isLandscapeLayout = useIsLandscapeLayout();

  return (
    <div className={cn("bg-background", isLandscapeLayout ? "min-h-full" : "min-h-screen pb-20")}>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(new ToPreviousRoute())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{isEdit ? Lang.creditcards.editCreditCard : Lang.creditcards.addCreditCard}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-6 p-4", isLandscapeLayout ? "mx-auto max-w-3xl pb-28" : "")}>
        <DescriptionField label={Lang.creditcards.cardName}>
          <Input {...register("name")} placeholder="Ex: Nubank Gold" />
        </DescriptionField>

        <DescriptionField label={Lang.creditcards.limit}>
          <PriceInput
            value={watch("limit")}
            onChange={(value) => setValue("limit", value)}
          />
        </DescriptionField>

        <DescriptionField label={Lang.creditcards.brand}>
          <SelectList
            options={brands}
            value={watch("brand")}
            onChange={(value) => setValue("brand", value)}
            placeholder={Lang.creditcards.selectBrand}
          />
        </DescriptionField>

        <DescriptionField label={Lang.creditcards.linkedAccount}>
          <SelectList
            options={accounts}
            value={watch("account")}
            onChange={(value) => setValue("account", value)}
            placeholder={Lang.timeline.selectAccountPlaceholder}
          />
        </DescriptionField>

        <DescriptionField
          label={Lang.creditcards.closingDay}
          description={Lang.creditcards.closingDayDescription}
        >
          <Input
            type="number"
            min="1"
            max="28"
            {...register("closingDay", { valueAsNumber: true })}
          />
        </DescriptionField>

        <DescriptionField
          label={Lang.creditcards.dueDay}
          description={Lang.creditcards.dueDayDescription}
        >
          <Input
            type="number"
            min="1"
            max="28"
            {...register("dueDay", { valueAsNumber: true })}
          />
        </DescriptionField>
      </form>

      <div className={cn(
        "z-30 border-t bg-background/95 p-4 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80",
        isLandscapeLayout ? "sticky bottom-0" : "fixed bottom-0 left-0 right-0"
      )}>
        <div className={cn("mx-auto flex gap-3", isLandscapeLayout ? "max-w-3xl" : "max-w-4xl")}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(new ToPreviousRoute())}
          >
            {Lang.commons.cancel}
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            onClick={handleSubmit(onSubmit)}
          >
            {isEdit ? Lang.commons.update : Lang.commons.save}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Navigation Routes
export class CreateCreditCardRoute {}

export class ToPreviousRoute extends CreateCreditCardRoute {}

export interface CreditCardForm {
  name: string;
  limit: number;
  brand: string;
  account: string;
  closingDay: number;
  dueDay: number;
}

export interface CreditCardViewModel {
  navigate: (route: CreateCreditCardRoute) => void;
  isEdit: boolean;
  register: UseFormRegister<CreditCardForm>;
  handleSubmit: UseFormHandleSubmit<CreditCardForm>;
  setValue: UseFormSetValue<CreditCardForm>;
  watch: UseFormWatch<CreditCardForm>;
  onSubmit: (data: CreditCardForm) => void;
  brands: SelectListOption[];
  accounts: SelectListOption[];
}
