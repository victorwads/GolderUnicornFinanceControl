import { ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { PriceInput } from "@components/ui/price-input";
import { SelectList, SelectListOption } from "@components/ui/select-list";
import { TagsInput } from "@components/ui/tags-input";
import { DescriptionField } from "@components/ui/description-field";

export default function CreateTransfer({
  model: {
    navigate,
    isEdit,
    register,
    handleSubmit,
    setValue,
    watch,
    onSubmit,
    accounts,
  }
}: {
  model: CreateTransferViewModel
}) {
  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(new ToPreviousRoute())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {isEdit ? "Editar Transferência" : "Nova Transferência"}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6 pb-24">
        <DescriptionField label="Conta Origem">
          <SelectList
            options={accounts}
            value={watch("fromAccount")}
            onChange={(value) => setValue("fromAccount", value)}
            placeholder="Selecione a conta de origem"
          />
        </DescriptionField>

        <DescriptionField label="Conta Destino">
          <SelectList
            options={accounts}
            value={watch("toAccount")}
            onChange={(value) => setValue("toAccount", value)}
            placeholder="Selecione a conta de destino"
          />
        </DescriptionField>

        <DescriptionField label="Valor">
          <PriceInput
            value={watch("amount")}
            onChange={(value) => setValue("amount", value)}
          />
        </DescriptionField>

        <DescriptionField label="Data">
          <Input type="date" {...register("date")} />
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

export interface TransferForm {
  fromAccount: string;
  toAccount: string;
  amount: number;
  date: string;
  tags: string[];
  notes: string;
}

export interface CreateTransferViewModel {
  navigate: (route: CreateTransferRoute) => void;
  isEdit: boolean;
  register: any;
  handleSubmit: (onValid: (data: TransferForm) => void) => (e: any) => void;
  setValue: (field: keyof TransferForm, value: any) => void;
  watch: (field?: keyof TransferForm) => any;
  onSubmit: (data: TransferForm) => void;
  accounts: SelectListOption[];
}

// Navigation Routes
export class CreateTransferRoute {}

export class ToPreviousRoute extends CreateTransferRoute {}
