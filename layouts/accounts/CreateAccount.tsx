import { X, DollarSign } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Checkbox } from "@components/ui/checkbox";
import { Card } from "@components/ui/card";

export default function CreateAccount({
  model: {
    navigate,
    formData,
    setFormData,
    banks,
    accountTypes,
    handleSubmit,
  }
}: {
  model: CreateAccountViewModel
}) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-foreground">Adicionar Conta</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(new ToMoreRoute())}
              className="hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-4 space-y-6 animate-fade-in">
          <Card className="p-6 bg-gradient-card border-border/50 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Nome da Conta
              </Label>
              <Input
                id="name"
                placeholder="Ex: Conta Corrente Principal"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 bg-background border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank" className="text-foreground">
                Banco
              </Label>
              <Select
                value={formData.bank}
                onValueChange={(value) => setFormData({ ...formData, bank: value })}
              >
                <SelectTrigger id="bank">
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance" className="text-foreground">
                Saldo Inicial
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                  className="h-12 pl-10 bg-background border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-foreground">
                Tipo
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color" className="text-foreground">
                Cor da Conta
              </Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-12 bg-background border-border cursor-pointer"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Checkbox
                id="includeTotal"
                checked={formData.includeInTotal}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, includeInTotal: checked as boolean })
                }
              />
              <Label
                htmlFor="includeTotal"
                className="text-sm text-foreground cursor-pointer"
              >
                Incluir no total
              </Label>
            </div>
          </Card>
        </form>

        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80 p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(new ToMoreRoute())}
              className="flex-1 h-12"
            >
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSubmit} className="flex-1 h-12">
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface CreateAccountForm {
  name: string;
  bank: string;
  initialBalance: string;
  type: string;
  color: string;
  includeInTotal: boolean;
}

export interface CreateAccountViewModel {
  navigate: (route: CreateAccountRoute) => void;
  formData: CreateAccountForm;
  setFormData: (data: CreateAccountForm) => void;
  banks: Array<{ id: string; name: string }>;
  accountTypes: Array<{ id: string; name: string }>;
  handleSubmit: (e: React.FormEvent) => void;
}

// Navigation Routes
export class CreateAccountRoute {}

export class ToMoreRoute extends CreateAccountRoute {}
