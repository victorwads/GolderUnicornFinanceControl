import { ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { PriceInput } from "@components/ui/price-input";
import { ColorPicker } from "@components/ui/color-picker";
import { SelectList, SelectListOption } from "@components/ui/select-list";
import { Checkbox } from "@components/ui/checkbox";
import { DescriptionField } from "@components/ui/description-field";

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
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(new ToPreviousRoute())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {isEdit ? "Editar Conta Bancária" : "Nova Conta Bancária"}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
        <DescriptionField label="Nome da Conta">
          <Input {...register("name")} placeholder="Ex: Conta Principal" />
        </DescriptionField>

        <DescriptionField label="Saldo Inicial">
          <PriceInput
            value={watch("initialBalance")}
            onChange={(value) => setValue("initialBalance", value)}
          />
        </DescriptionField>

        <DescriptionField label="Banco">
          <SelectList
            options={banks}
            value={watch("bank")}
            onChange={(value) => setValue("bank", value)}
            placeholder="Selecione o banco"
          />
        </DescriptionField>

        <DescriptionField label="Tipo de Conta">
          <SelectList
            options={accountTypes}
            value={watch("type")}
            onChange={(value) => setValue("type", value)}
            placeholder="Selecione o tipo"
          />
        </DescriptionField>

        <DescriptionField label="Cor">
          <ColorPicker
            value={watch("color")}
            onChange={(value) => setValue("color", value)}
          />
        </DescriptionField>

        <DescriptionField
          label="Incluir no Saldo Total"
          description="Define se o saldo dessa conta deve ser incluído no cálculo total exibido na tela principal."
        >
          <div className="flex items-center gap-2">
            <Checkbox
              checked={watch("includeInTotal")}
              onCheckedChange={(checked) => setValue("includeInTotal", !!checked)}
            />
            <span className="text-sm">Incluir esta conta no saldo total</span>
          </div>
        </DescriptionField>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(new ToPreviousRoute())}
          >
            Cancelar
          </Button>
          <Button type="submit" className="flex-1">
            {isEdit ? "Atualizar" : "Salvar"}
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
