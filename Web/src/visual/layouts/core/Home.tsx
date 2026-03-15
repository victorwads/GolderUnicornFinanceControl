import { BalanceCard } from "@components/BalanceCard";
import { QuickActions } from "@components/QuickActions";
import { Card } from "@components/ui/card";
import { CreditCard, Wallet } from "lucide-react";
import { Skeleton } from "@components/ui/skeleton";
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
  const { creditCards, accounts, totalInvoices, totalBalance, openAccordions, handleAccordionChange, userName } = model;
  const locale = CurrentLangInfo.short;
  const formatCurrency = (value: number) =>
    value.toLocaleString(locale, {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  const availableMonths = ["2024-11", "2024-10", "2024-09"];
  const formatMonthOption = (value: string) => {
    const [year, month] = value.split("-").map(Number);
    return new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(new Date(year, month - 1, 1));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6 animate-fade-in">
      <header className="pt-4 pb-2">
        <h1 className="text-2xl font-bold text-foreground">{Lang.visual.home.greeting(userName)}</h1>
        <p className="text-muted-foreground">{Lang.visual.home.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceCard accountsCount={accounts.length} totalBalance={totalBalance} />

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">{Lang.visual.home.quickActions}</h2>
          <QuickActions />
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <p className="text-sm font-semibold text-foreground">{Lang.accounts.title}</p>
                    <p className="text-xs text-muted-foreground">{Lang.visual.home.accountsActive(accounts.length)}</p>
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
                      {!account.balance && account.balance !== 0 ? (
                        <Skeleton className="h-5 w-20" />
                      ) : (
                        <p className="text-sm font-bold text-foreground">{formatCurrency(account.balance || 0)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        </Accordion>

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
                    <p className="text-sm font-semibold text-foreground">{Lang.creditcards.title}</p>
                    <p className="text-xs text-muted-foreground">{Lang.visual.home.creditCardsCount(creditCards.length)}</p>
                  </div>
                  <Select defaultValue="11-2024">
                    <SelectTrigger className="w-[110px] h-8 text-xs mr-2" onClick={(e) => e.stopPropagation()}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMonths.map((value) => (
                        <SelectItem key={value} value={value}>
                          {formatMonthOption(value)}
                        </SelectItem>
                      ))}
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
                      {!card.invoice && card.invoice !== 0 ? (
                        <Skeleton className="h-5 w-20" />
                      ) : (
                        <p className="text-sm font-bold text-foreground">{formatCurrency(card.invoice || 0)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
              <div className="px-4 py-3 border-t border-border bg-accent/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">{Lang.visual.home.totalInvoices}</p>
                  {totalInvoices === null ? (
                    <Skeleton className="h-6 w-28" />
                  ) : (
                    <p className="text-base font-bold text-primary">{formatCurrency(totalInvoices)}</p>
                  )}
                </div>
              </div>
            </Card>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export interface CreditCard {
  id: string;
  name: string;
  brand: string;
  invoice?: number | null;
  color?: string;
}

export interface Account {
  id: string;
  name: string;
  bank: string;
  balance?: number;
  color?: string;
}

export interface HomeViewModel {
  userName: string;
  navigate: (path: string) => void;
  creditCards: CreditCard[];
  accounts: Account[];
  totalInvoices: number | null;
  totalBalance: number | null;
  openAccordions: string[];
  handleAccordionChange: (accordionId: string) => (value: string) => void;
}
