import { ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { PriceInput } from "@components/ui/price-input";
import { ColorPicker } from "@components/ui/color-picker";
import { SelectList, SelectListOption } from "@components/ui/select-list";
import { Checkbox } from "@components/ui/checkbox";
import { DescriptionField } from "@components/ui/description-field";
import { useIsLandscapeLayout } from "@hooks/use-mobile";
import { cn } from "@lib/utils";

export default function CreateBankAccount({
  model: {
    navigate,
    isEdit,
    register,
    handleSubmit,
    setValue,
    watch,
    onSubmit,
    banks,
    accountTypes,
  }
}: {
  model: BankAccountViewModel
}) {
  const isLandscapeLayout = useIsLandscapeLayout();

  return (
    <div className={cn("bg-background", isLandscapeLayout ? "min-h-full" : "min-h-screen pb-20")}>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(new ToPreviousRoute())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{isEdit ? Lang.accounts.editBankAccount : Lang.accounts.newBankAccount}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-6 p-4", isLandscapeLayout ? "mx-auto max-w-3xl pb-6" : "")}>
        <DescriptionField label={Lang.accounts.accountName}>
          <Input {...register("name")} placeholder="Ex: Conta Principal" />
        </DescriptionField>

        <DescriptionField label={Lang.accounts.initialBalance}>
          <PriceInput
            value={watch("initialBalance")}
            onChange={(value) => setValue("initialBalance", value)}
          />
        </DescriptionField>

        <DescriptionField label={Lang.accounts.bank}>
          <SelectList
            options={banks}
            value={watch("bank")}
            onChange={(value) => setValue("bank", value)}
            placeholder={Lang.accounts.selectBank}
          />
        </DescriptionField>

        <DescriptionField label={Lang.accounts.accountType}>
          <SelectList
            options={accountTypes}
            value={watch("type")}
            onChange={(value) => setValue("type", value)}
            placeholder={Lang.accounts.selectType}
          />
        </DescriptionField>

        <DescriptionField label={Lang.categories.color}>
          <ColorPicker
            value={watch("color")}
            onChange={(value) => setValue("color", value)}
          />
        </DescriptionField>

        <DescriptionField
          label={Lang.accounts.includeInTotal}
          description={Lang.accounts.includeInTotalDescription}
        >
          <div className="flex items-center gap-2">
            <Checkbox
              checked={watch("includeInTotal")}
              onCheckedChange={(checked) => setValue("includeInTotal", !!checked)}
            />
            <span className="text-sm">{Lang.accounts.includeInTotalLabel}</span>
          </div>
        </DescriptionField>

        <div className={cn("flex gap-3 pt-4", isLandscapeLayout ? "sticky bottom-0 border-t bg-background/95 py-4 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80" : "")}>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(new ToPreviousRoute())}
          >
            {Lang.commons.cancel}
          </Button>
          <Button type="submit" className="flex-1">
            {isEdit ? Lang.commons.update : Lang.commons.save}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Navigation Routes
export class CreateBankAccountRoute {}

export class ToPreviousRoute extends CreateBankAccountRoute {}

export interface BankAccountForm {
  name: string;
  initialBalance: number;
  bank: string;
  type: string;
  color: string;
  includeInTotal: boolean;
}

export interface BankAccountViewModel {
  navigate: (route: CreateBankAccountRoute) => void;
  isEdit: boolean;
  register: any;
  handleSubmit: (onValid: (data: BankAccountForm) => void) => (e: any) => void;
  setValue: (field: keyof BankAccountForm, value: any) => void;
  watch: (field: keyof BankAccountForm) => any;
  onSubmit: (data: BankAccountForm) => void;
  banks: SelectListOption[];
  accountTypes: SelectListOption[];
}
