import { ArrowLeft } from "lucide-react";
import { UseFormRegister, UseFormHandleSubmit, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { PriceInput } from "@components/ui/price-input";
import { SelectList, SelectListOption } from "@components/ui/select-list";
import { MonthYearPicker } from "@components/ui/month-year-picker";
import { TagsInput } from "@components/ui/tags-input";
import { DescriptionField } from "@components/ui/description-field";
import { Switch } from "@components/ui/switch";
import { Label } from "@components/ui/label";
import { Card } from "@components/ui/card";
import { TransactionItem } from "@components/TransactionItem";

interface AddCreditCardTransactionProps {
  model: AddCreditCardTransactionViewModel;
}

export default function AddCreditCardTransaction({ model }: AddCreditCardTransactionProps) {
  const {
    navigate,
    isEdit,
    register,
    handleSubmit,
    setValue,
    watch,
    onSubmit,
    cards,
    categories,
    installmentValue,
    installmentPreviews,
  } = model;

  const amount = watch("amount");
  const installments = watch("installments");
  const isInstallment = watch("isInstallment");
  const invoiceMonth = watch("invoiceMonth");
  const description = watch("description");
  const category = watch("category");

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(new ToPreviousRoute())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {isEdit ? "Editar Despesa no Cartão" : "Nova Despesa no Cartão"}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6 pb-24">
        <DescriptionField label="Cartão">
          <SelectList
            options={cards}
            value={watch("card")}
            onChange={(value) => setValue("card", value)}
            placeholder="Selecione o cartão"
          />
        </DescriptionField>

        <DescriptionField label="Mês/Ano da Fatura">
          <MonthYearPicker
            value={watch("invoiceMonth")}
            onChange={(value) => setValue("invoiceMonth", value)}
          />
        </DescriptionField>

        <DescriptionField label="Valor">
          <PriceInput
            value={watch("amount")}
            onChange={(value) => setValue("amount", value)}
          />
        </DescriptionField>

        <DescriptionField label="Descrição">
          <Input {...register("description")} placeholder="Ex: Compras online" />
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

        <Card className="p-4 border-2 border-primary/20 bg-gradient-card">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="installment-toggle" className="text-base font-semibold">
                  Parcelamento
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Divida a compra em várias faturas
                </p>
              </div>
              <Switch
                id="installment-toggle"
                checked={isInstallment}
                onCheckedChange={(checked) => setValue("isInstallment", checked)}
              />
            </div>

            {isInstallment && (
              <div className="space-y-4 pt-2">
                <DescriptionField label="Número de Parcelas">
                  <Input
                    type="number"
                    min="2"
                    max="24"
                    {...register("installments", { valueAsNumber: true })}
                  />
                  {installments > 1 && amount > 0 && (
                    <div className="mt-2 p-3 bg-primary/10 rounded-md border border-primary/20">
                      <p className="text-sm font-medium">
                        {installments}x de R$ {installmentValue.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  )}
                </DescriptionField>

                {installmentPreviews.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">
                        Próximas Cobranças
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {installmentPreviews.length} parcelas
                      </span>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {installmentPreviews.map((preview) => (
                        <TransactionItem
                          key={preview.id}
                          title={description || "Nova compra"}
                          category={category || "Compras"}
                          amount={-installmentValue}
                          date={preview.date}
                          type="expense"
                          account={watch("card")}
                          isPaid={preview.isPaid}
                          transactionType="credit"
                          installmentInfo={`${preview.installmentNumber}/${installments}`}
                          originalDate={invoiceMonth ? 
                            `${invoiceMonth.split("-")[1]}/${invoiceMonth.split("-")[0]}` 
                            : undefined
                          }
                          compact
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
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
export class AddCreditCardTransactionRoute {}

export class ToPreviousRoute extends AddCreditCardTransactionRoute {}

export interface CreditCardTransactionForm {
  card: string;
  invoiceMonth: string;
  amount: number;
  description: string;
  category: string;
  tags: string[];
  notes: string;
  isInstallment: boolean;
  installments: number;
}

export interface InstallmentPreview {
  id: number;
  date: string;
  monthYear: string;
  installmentNumber: number;
  isPaid: boolean;
}

export interface AddCreditCardTransactionViewModel {
  navigate: (route: AddCreditCardTransactionRoute) => void;
  isEdit: boolean;
  register: UseFormRegister<CreditCardTransactionForm>;
  handleSubmit: UseFormHandleSubmit<CreditCardTransactionForm>;
  setValue: UseFormSetValue<CreditCardTransactionForm>;
  watch: UseFormWatch<CreditCardTransactionForm>;
  onSubmit: (data: CreditCardTransactionForm) => void;
  cards: SelectListOption[];
  categories: SelectListOption[];
  installmentValue: number;
  installmentPreviews: InstallmentPreview[];
}
