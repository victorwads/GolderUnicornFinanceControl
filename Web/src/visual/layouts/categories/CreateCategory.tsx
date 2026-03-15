import { ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { ColorPicker } from "@components/ui/color-picker";
import { SelectList, SelectListOption } from "@components/ui/select-list";
import { IconSearch } from "@components/ui/icon-search";
import { DescriptionField } from "@components/ui/description-field";
import Icon, { iconNamesList, getIconByCaseInsensitiveName } from "@components/Icons";
import { useIsLandscapeLayout } from "@hooks/use-mobile";
import { cn } from "@lib/utils";

export default function CreateCategory({
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
  model: CreateCategoryViewModel
}) {
  const isLandscapeLayout = useIsLandscapeLayout();

  return (
    <div className={cn("bg-background", isLandscapeLayout ? "min-h-full" : "min-h-screen pb-20")}>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(new ToPreviousRoute())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{isEdit ? Lang.categories.editCategory : Lang.categories.newCategory}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-6 p-4", isLandscapeLayout ? "mx-auto max-w-3xl pb-28" : "")}>
        <DescriptionField label={Lang.categories.categoryName}>
          <Input {...register("name")} placeholder="Ex: Restaurantes" />
        </DescriptionField>

        <DescriptionField label={Lang.categories.icon}>
          <IconSearch
            iconList={iconNamesList}
            value={watch("icon")}
            onChange={(value) => setValue("icon", value)}
            renderIcon={(iconName) => (
              <Icon icon={getIconByCaseInsensitiveName(iconName)} />
            )}
          />
        </DescriptionField>

        <DescriptionField label={Lang.categories.color}>
          <ColorPicker
            value={watch("color")}
            onChange={(value) => setValue("color", value)}
          />
        </DescriptionField>

        <DescriptionField label={Lang.categories.parentCategory}>
          <SelectList
            options={categories}
            value={watch("parentCategory")}
            onChange={(value) => setValue("parentCategory", value)}
            placeholder={Lang.categories.noParentCategory}
            allowSelectHeader={true}
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
export class CreateCategoryRoute {}

export class ToPreviousRoute extends CreateCategoryRoute {}

export interface CategoryForm {
  name: string;
  icon: string;
  color: string;
  parentCategory?: string;
}

export interface CreateCategoryViewModel {
  navigate: (route: CreateCategoryRoute) => void;
  isEdit: boolean;
  register: any;
  handleSubmit: (onValid: (data: CategoryForm) => void) => (e: any) => void;
  setValue: (field: keyof CategoryForm, value: any) => void;
  watch: (field: keyof CategoryForm) => any;
  onSubmit: (data: CategoryForm) => void;
  categories: SelectListOption[];
}
