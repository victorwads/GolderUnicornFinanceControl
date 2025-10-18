import { ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { PriceInput } from "@components/ui/price-input";
import { SelectList, SelectListOption } from "@components/ui/select-list";
import { Checkbox } from "@components/ui/checkbox";
import { TagsInput } from "@components/ui/tags-input";
import { DescriptionField } from "@components/ui/description-field";
import { categories } from "@/data/categories";

export default function AddAccountTransaction({
  model: {
    isEdit, isIncome, navigate, register, handleSubmit, setValue, watch, accounts, onSubmit
  }
}: {
  model: AccountTransactionViewModel
}) {
  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(new ToPreviousRoute())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {isEdit 
              ? `Editar ${isIncome ? "Entrada" : "Despesa"}` 
              : `Nova ${isIncome ? "Entrada" : "Despesa"}`}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6 pb-24">
        <DescriptionField label="Conta">
          <SelectList
            options={accounts}
            value={watch("account")}
            onChange={(value) => setValue("account", value)}
            placeholder="Selecione a conta"
          />
        </DescriptionField>

        <DescriptionField label="Valor">
          <PriceInput
            value={watch("amount")}
            onChange={(value) => setValue("amount", value)}
          />
        </DescriptionField>

        <DescriptionField label="Descrição">
          <Input 
            {...register("description")} 
            placeholder={isIncome ? "Ex: Salário" : "Ex: Compras do mercado"} 
          />
        </DescriptionField>

        <DescriptionField label="Data">
          <Input type="date" {...register("date")} />
        </DescriptionField>

        <DescriptionField label="Categoria">
          <SelectList
            options={categories}
            value={watch("category")}
            onChange={(value) => setValue("category", value)}
            placeholder="Selecione a categoria"
            allowSelectHeader={true}
          />
        </DescriptionField>

        <DescriptionField label="Tags">
          <TagsInput
            value={watch("tags")}
            onChange={(value) => setValue("tags", value)}
            placeholder="Digite e pressione Enter"
          />
        </DescriptionField>

        <DescriptionField label="Observação">
          <Textarea
            {...register("notes")}
            placeholder="Adicione observações..."
            rows={3}
          />
        </DescriptionField>

        <DescriptionField label="Status">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={watch("isPaid")}
              onCheckedChange={(checked) => setValue("isPaid", !!checked)}
            />
            <span className="text-sm">{isIncome ? "Recebido" : "Pago"}</span>
          </div>
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

export interface AccountTransactionForm {
  account: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  tags: string[];
  notes: string;
  isPaid: boolean;
}

export interface AccountTransactionViewModel {
  navigate: (route: AccountTransactionRoute) => void;
  isEdit: boolean;
  isIncome: boolean;
  register: any;
  accounts: SelectListOption[];
  handleSubmit: (onValid: (data: AccountTransactionForm) => void) => (e: any) => void;
  onSubmit: (data: AccountTransactionForm) => void;
  setValue: (field: keyof AccountTransactionForm, value: any) => void;
  watch: (field: keyof AccountTransactionForm) => any;
}

// Navigation Routes
export class AccountTransactionRoute {}

export class ToPreviousRoute extends AccountTransactionRoute {}
