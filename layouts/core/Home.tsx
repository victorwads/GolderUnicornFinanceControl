import { Button } from "@components/ui/button";
import { BalanceCard } from "@components/BalanceCard";
import { QuickActions } from "@components/QuickActions";
import { TransactionItem } from "@components/TransactionItem";
import { TabBar } from "@components/TabBar";
import { MicButton } from "@components/MicButton";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { ChevronDown, Plus, ArrowUpRight, Calendar, Receipt, Building2, CreditCard, Wallet } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";

interface HomeProps {
  model: HomeViewModel;
}

export default function Home({ model }: HomeProps) {
  const { creditCards, accounts, totalInvoices, openAccordions, handleAccordionChange } = model;

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-7xl mx-auto p-4 space-y-6 animate-fade-in">
        <header className="pt-4 pb-2">
          <h1 className="text-2xl font-bold text-foreground">Olá, Maria 👋</h1>
          <p className="text-muted-foreground">Confira seu resumo financeiro</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BalanceCard accountsCount={accounts.length} />

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Ações Rápidas</h2>
            <QuickActions />
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Accordion 
            type="single" 
            collapsible 
            value={openAccordions.includes('credit-cards') ? 'credit-cards' : ''}
            onValueChange={handleAccordionChange('credit-cards')}
          >
            <AccordionItem value="credit-cards" className="border-0">
              <Card className="overflow-hidden border-border/50">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold text-foreground">Cartões de Crédito</p>
                      <p className="text-xs text-muted-foreground">{creditCards.length} cartões</p>
                    </div>
                    <Select defaultValue="11-2024">
                      <SelectTrigger className="w-[110px] h-8 text-xs mr-2" onClick={(e) => e.stopPropagation()}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="11-2024">Nov/2024</SelectItem>
                        <SelectItem value="10-2024">Out/2024</SelectItem>
                        <SelectItem value="09-2024">Set/2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-2 pt-2">
                    {creditCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                      >
                        <div className={`h-8 w-8 rounded-lg ${card.color} flex items-center justify-center`}>
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{card.name}</p>
                          <p className="text-xs text-muted-foreground">{card.brand}</p>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          R$ {card.invoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
                <div className="px-4 py-3 border-t border-border bg-accent/20">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">Total das Faturas</p>
                    <p className="text-base font-bold text-primary">
                      R$ {totalInvoices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </Card>
            </AccordionItem>
          </Accordion>

          <Accordion 
            type="single" 
            collapsible
            value={openAccordions.includes('accounts') ? 'accounts' : ''}
            onValueChange={handleAccordionChange('accounts')}
          >
            <AccordionItem value="accounts" className="border-0">
              <Card className="overflow-hidden border-border/50">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold text-foreground">Contas</p>
                      <p className="text-xs text-muted-foreground">{accounts.length} contas ativas</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-2 pt-2">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                      >
                        <div className={`h-8 w-8 rounded-lg ${account.color} flex items-center justify-center`}>
                          <Wallet className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{account.name}</p>
                          <p className="text-xs text-muted-foreground">{account.bank}</p>
                        </div>
                        <p className="text-sm font-bold text-foreground">
                          R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <MicButton />
      <TabBar />
    </div>
  );
}

export interface CreditCard {
  id: number;
  name: string;
  brand: string;
  invoice: number;
  color: string;
}

export interface Account {
  id: number;
  name: string;
  bank: string;
  balance: number;
  color: string;
}

export interface HomeViewModel {
  navigate: (path: string) => void;
  creditCards: CreditCard[];
  accounts: Account[];
  totalInvoices: number;
  openAccordions: string[];
  handleAccordionChange: (accordionId: string) => (value: string) => void;
}
