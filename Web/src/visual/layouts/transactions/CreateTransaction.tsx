import { X, DollarSign, Calendar } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Checkbox } from "@components/ui/checkbox";
import { Card } from "@components/ui/card";

export default function CreateTransaction({
  model: {
    navigate,
    formData,
    setFormData,
    handleSubmit,
    accounts,
    categories,
  }
}: {
  model: CreateTransactionViewModel
}) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-foreground">Novo Registro</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(new ToTimelineRoute())}
              className="hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-4 space-y-6 animate-fade-in">
          <Card className="p-6 bg-gradient-card border-border/50 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">
                Descrição
              </Label>
              <Input
                id="description"
                placeholder="Ex: Almoço no restaurante"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="h-12 bg-background border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground">
                Valor
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="h-12 pl-10 bg-background border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground">
                Data
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="h-12 pl-10 bg-background border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account" className="text-foreground">
                Conta
              </Label>
              <Select
                value={formData.account}
                onValueChange={(value) => setFormData({ ...formData, account: value })}
              >
                <SelectTrigger id="account">
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Categoria
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Checkbox
                id="isPaid"
                checked={formData.isPaid}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPaid: checked as boolean })
                }
              />
              <Label htmlFor="isPaid" className="text-sm text-foreground cursor-pointer">
                Pago
              </Label>
            </div>
          </Card>
        </form>

        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur-[2px] supports-[backdrop-filter]:bg-background/80 p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(new ToTimelineRoute())}
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

export interface TransactionFormData {
  description: string;
  amount: string;
  date: string;
  account: string;
  category: string;
  isPaid: boolean;
}

export interface Account {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CreateTransactionViewModel {
  navigate: (route: CreateTransactionRoute) => void;
  formData: TransactionFormData;
  setFormData: (data: TransactionFormData) => void;
  handleSubmit: (e: React.FormEvent) => void;
  accounts: Account[];
  categories: Category[];
}

// Navigation Routes
export class CreateTransactionRoute {}

export class ToTimelineRoute extends CreateTransactionRoute {}
