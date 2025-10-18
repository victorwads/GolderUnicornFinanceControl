import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { ArrowLeft, Plus, CreditCard, ChevronRight } from "lucide-react";
import { MicButton } from "@components/MicButton";
import { TabBar } from "@components/TabBar";

export default function CreditCardsList({
  model: {
    navigate,
    creditCards,
  }
}: {
  model: CreditCardsListViewModel
}) {
  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(new ToMoreRoute())}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Cartões de Crédito</h1>
                <p className="text-sm text-muted-foreground">{creditCards.length} cartões cadastrados</p>
              </div>
            </div>
            <Button
              size="icon"
              onClick={() => navigate(new ToCreateCreditCardRoute())}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="p-4 space-y-3 animate-fade-in">
          {creditCards.map((card) => (
            <Card
              key={card.id}
              className="p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors cursor-pointer border-border/50"
              onClick={() => navigate(new ToEditCreditCardRoute(card.id.toString()))}
            >
              <div className={`h-12 w-12 rounded-lg ${card.color} flex items-center justify-center`}>
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-foreground truncate">{card.name}</p>
                <p className="text-sm text-muted-foreground">{card.brand}</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Limite</p>
                  <p className="text-base font-bold text-foreground">
                    R$ {card.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          ))}
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
  limit: number;
  color: string;
}

export interface CreditCardsListViewModel {
  navigate: (route: CreditCardsRoute) => void;
  creditCards: CreditCard[];
}

// Navigation Routes
export class CreditCardsRoute {}

export class ToMoreRoute extends CreditCardsRoute {}
export class ToCreateCreditCardRoute extends CreditCardsRoute {}
export class ToEditCreditCardRoute extends CreditCardsRoute {
  constructor(public cardId: string) { super() }
}
