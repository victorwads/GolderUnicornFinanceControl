import { ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { ColorPicker } from "@components/ui/color-picker";
import { SelectList } from "@components/ui/select-list";
import { IconSearch } from "@components/ui/icon-search";
import { DescriptionField } from "@components/ui/description-field";
import Icon, { iconNamesList, getIconByCaseInsensitiveName } from "@components/Icons";
import { categories } from "@/data/categories";

export default function CreateCategory({
  model: {
    navigate,
    isEdit,
    register,
    handleSubmit,
    setValue,
    watch,
    onSubmit,
  }
}: {
  model: CreateCategoryViewModel
}) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(new ToPreviousRoute())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {isEdit ? "Editar Categoria" : "Nova Categoria"}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
        <DescriptionField label="Nome">
          <Input {...register("name")} placeholder="Ex: Restaurantes" />
        </DescriptionField>

        <DescriptionField label="Ícone">
          <IconSearch
            iconList={iconNamesList}
            value={watch("icon")}
            onChange={(value) => setValue("icon", value)}
            renderIcon={(iconName) => (
              <Icon icon={getIconByCaseInsensitiveName(iconName)} />
            )}
          />
        </DescriptionField>

        <DescriptionField label="Cor">
          <ColorPicker
            value={watch("color")}
            onChange={(value) => setValue("color", value)}
          />
        </DescriptionField>

        <DescriptionField label="Categoria Pai (opcional)">
          <SelectList
            options={categories}
            value={watch("parentCategory")}
            onChange={(value) => setValue("parentCategory", value)}
            placeholder="Nenhuma"
            allowSelectHeader={true}
          />
        </DescriptionField>
      </form>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(new ToPreviousRoute())}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="flex-1"
            onClick={handleSubmit(onSubmit)}
          >
            {isEdit ? "Atualizar" : "Salvar"}
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
}
