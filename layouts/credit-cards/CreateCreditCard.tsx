import { UseFormRegister, UseFormHandleSubmit, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { PriceInput } from "@components/ui/price-input";
import { SelectList, SelectListOption } from "@components/ui/select-list";
import { DescriptionField } from "@components/ui/description-field";

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
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(new ToPreviousRoute())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {isEdit ? "Editar Cartão de Crédito" : "Novo Cartão de Crédito"}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
        <DescriptionField label="Nome do Cartão">
          <Input {...register("name")} placeholder="Ex: Nubank Gold" />
        </DescriptionField>

        <DescriptionField label="Limite">
          <PriceInput
            value={watch("limit")}
            onChange={(value) => setValue("limit", value)}
          />
        </DescriptionField>

        <DescriptionField label="Bandeira">
          <SelectList
            options={brands}
            value={watch("brand")}
            onChange={(value) => setValue("brand", value)}
            placeholder="Selecione a bandeira"
          />
        </DescriptionField>

        <DescriptionField label="Conta Vinculada">
          <SelectList
            options={accounts}
            value={watch("account")}
            onChange={(value) => setValue("account", value)}
            placeholder="Selecione a conta"
          />
        </DescriptionField>

        <DescriptionField
          label="Dia de Fechamento"
          description="Dia de fechamento é o dia em que a fatura é cortada — todas as compras feitas depois dessa data entrarão na próxima fatura."
        >
          <Input
            type="number"
            min="1"
            max="28"
            {...register("closingDay", { valueAsNumber: true })}
          />
        </DescriptionField>

        <DescriptionField
          label="Dia de Vencimento"
          description="Dia de vencimento é o dia limite para pagamento da fatura atual."
        >
          <Input
            type="number"
            min="1"
            max="28"
            {...register("dueDay", { valueAsNumber: true })}
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
