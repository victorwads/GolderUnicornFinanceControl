import { ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { PriceInput } from "@components/ui/price-input";
import { SelectList, SelectListOption } from "@components/ui/select-list";
import { TagsInput } from "@components/ui/tags-input";
import { DescriptionField } from "@components/ui/description-field";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { Label } from "@components/ui/label";

export default function CreateRecurrent({
  model: {
    navigate,
    isEdit,
    register,
    handleSubmit,
    setValue,
    watch,
    onSubmit,
    type,
    recurrenceDay,
    amount,
    generatePreview,
    accounts,
    categories,
    cards,
  }
}: {
  model: CreateRecurrentViewModel
}) {
  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(new ToPreviousRoute())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{isEdit ? Lang.recurrent.editRecurrent : Lang.recurrent.newRecurrent}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6 pb-24">
        <DescriptionField label={Lang.recurrent.transactionType}>
          <RadioGroup value={type} onValueChange={(value: any) => setValue("type", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="account" id="account" />
              <Label htmlFor="account">{Lang.recurrent.bankAccount}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="creditcard" id="creditcard" />
              <Label htmlFor="creditcard">{Lang.recurrent.creditCard}</Label>
            </div>
          </RadioGroup>
        </DescriptionField>

        <DescriptionField label={type === "account" ? Lang.registry.account : Lang.creditcards.account}>
          <SelectList
            options={type === "account" ? accounts : cards}
            value={watch("accountOrCard")}
            onChange={(value) => setValue("accountOrCard", value)}
            placeholder={type === "account" ? Lang.recurrent.selectAccount : Lang.recurrent.selectCard}
          />
        </DescriptionField>

        <DescriptionField label={Lang.recurrent.day} description={Lang.recurrent.recurrenceDayDescription}>
          <Input
            type="number"
            min="1"
            max="28"
            {...register("recurrenceDay", { valueAsNumber: true })}
          />
        </DescriptionField>

        <DescriptionField label={Lang.registry.value}>
          <PriceInput
            value={watch("amount")}
            onChange={(value) => setValue("amount", value)}
          />
        </DescriptionField>

        <DescriptionField label={Lang.registry.description}>
          <Input {...register("description")} placeholder={Lang.registry.descriptionExpensePlaceholder} />
        </DescriptionField>

        <DescriptionField label={Lang.registry.category}>
          <SelectList
            options={categories}
            value={watch("category")}
            onChange={(value) => setValue("category", value)}
            placeholder={Lang.timeline.selectCategoriesPlaceholder}
            allowSelectHeader={true}
          />
        </DescriptionField>

        <DescriptionField label={Lang.registry.tags}>
          <TagsInput
            value={watch("tags")}
            onChange={(value) => setValue("tags", value)}
            placeholder={Lang.commons.typeAndPressEnter}
          />
        </DescriptionField>

        <DescriptionField label={Lang.registry.notes}>
          <Textarea
            {...register("notes")}
            placeholder={Lang.commons.addNotes}
            rows={3}
          />
        </DescriptionField>

        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h3 className="font-semibold text-sm">{Lang.recurrent.nextRecurrences}</h3>
          {generatePreview().map((date, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{date.toLocaleDateString(CurrentLangInfo.short)}</span>
              <span className="text-muted-foreground">{new Intl.NumberFormat(CurrentLangInfo.short, { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(amount)}</span>
            </div>
          ))}
        </div>
      </form>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
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
export class CreateRecurrentRoute {}

export class ToPreviousRoute extends CreateRecurrentRoute {}

export interface RecurrentForm {
  type: "account" | "creditcard";
  accountOrCard: string;
  recurrenceDay: number;
  amount: number;
  description: string;
  category: string;
  tags: string[];
  notes: string;
}

export interface CreateRecurrentViewModel {
  navigate: (route: CreateRecurrentRoute) => void;
  isEdit: boolean;
  register: any;
  handleSubmit: (onValid: (data: RecurrentForm) => void) => (e: any) => void;
  setValue: (field: keyof RecurrentForm, value: any) => void;
  watch: (field?: keyof RecurrentForm) => any;
  onSubmit: (data: RecurrentForm) => void;
  type: "account" | "creditcard";
  recurrenceDay: number;
  amount: number;
  generatePreview: () => Date[];
  accounts: SelectListOption[];
  categories: SelectListOption[];
  cards: SelectListOption[];
}
