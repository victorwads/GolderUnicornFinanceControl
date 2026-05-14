import { ArrowLeft } from "lucide-react";

import type { SelectListOption } from "@components/ui/select-list";
import { Button } from "@components/ui/button";
import { DescriptionField } from "@components/ui/description-field";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { PriceInput } from "@components/ui/price-input";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { SelectList } from "@components/ui/select-list";
import { TagsInput } from "@components/ui/tags-input";
import { Textarea } from "@components/ui/textarea";

export default function CreateWishlistItem({
  model: {
    navigate,
    isEdit,
    register,
    handleSubmit,
    setValue,
    watch,
    onSubmit,
    categories,
  }
}: {
  model: CreateWishlistItemViewModel
}) {
  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(new ToPreviousRoute())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {isEdit ? Lang.wishlist.editItem : Lang.wishlist.newItem}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 pb-24">
        <DescriptionField label={Lang.registry.description}>
          <Input {...register("description")} placeholder={Lang.wishlist.descriptionPlaceholder} />
        </DescriptionField>

        <DescriptionField label={Lang.registry.value}>
          <PriceInput value={watch("amount")} onChange={(value) => setValue("amount", value)} />
        </DescriptionField>

        <DescriptionField label={Lang.wishlist.targetDate} description={Lang.wishlist.targetDateDescription}>
          <Input type="date" {...register("targetDate")} />
        </DescriptionField>

        <DescriptionField label={Lang.wishlist.priority.label}>
          <RadioGroup value={watch("priority")} onValueChange={(value: WishlistPriority) => setValue("priority", value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="wishlist-priority-high" />
              <Label htmlFor="wishlist-priority-high">{Lang.wishlist.priority.high}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="medium" id="wishlist-priority-medium" />
              <Label htmlFor="wishlist-priority-medium">{Lang.wishlist.priority.medium}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="wishlist-priority-low" />
              <Label htmlFor="wishlist-priority-low">{Lang.wishlist.priority.low}</Label>
            </div>
          </RadioGroup>
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
          <Textarea {...register("notes")} placeholder={Lang.commons.addNotes} rows={3} />
        </DescriptionField>
      </form>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 p-4 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-4xl gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(new ToPreviousRoute())}>
            {Lang.commons.cancel}
          </Button>
          <Button type="submit" className="flex-1" onClick={handleSubmit(onSubmit)}>
            {isEdit ? Lang.commons.update : Lang.commons.save}
          </Button>
        </div>
      </div>
    </div>
  );
}

export type WishlistPriority = "low" | "medium" | "high";

export interface WishlistItemForm {
  description: string;
  amount: number;
  targetDate: string;
  priority: WishlistPriority;
  category: string;
  tags: string[];
  notes: string;
}

export interface CreateWishlistItemViewModel {
  navigate: (route: CreateWishlistItemRoute) => void;
  isEdit: boolean;
  register: any;
  handleSubmit: (onValid: (data: WishlistItemForm) => void) => (e: any) => void;
  setValue: (field: keyof WishlistItemForm, value: any) => void;
  watch: (field?: keyof WishlistItemForm) => any;
  onSubmit: (data: WishlistItemForm) => void;
  categories: SelectListOption[];
}

export class CreateWishlistItemRoute {}
export class ToPreviousRoute extends CreateWishlistItemRoute {}
