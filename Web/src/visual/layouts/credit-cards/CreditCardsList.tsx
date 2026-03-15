import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { ArrowLeft, Plus, CreditCard, ChevronRight } from "lucide-react";
import { resolveBankResourceUrl } from "@lib/assetUrls";
import { cn } from "@lib/utils";

function getColorProps(color: string) {
  if (color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl")) {
    return {
      className: "",
      style: { backgroundColor: color },
    };
  }

  return {
    className: color,
    style: undefined,
  };
}

export default function CreditCardsList({
  model: {
    navigate,
    creditCards,
    selectedCreditCardId,
  },
  embedded = false,
}: {
  model: CreditCardsListViewModel;
  embedded?: boolean;
}) {
  const formatCurrency = (value: number) =>
    value.toLocaleString(CurrentLangInfo.short, {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  return (
    <div className={cn("mx-auto", embedded ? "min-h-full" : "max-w-4xl")}>
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
              <h1 className="text-2xl font-bold text-foreground">{Lang.creditcards.title}</h1>
              <p className="text-sm text-muted-foreground">{Lang.creditcards.cardsListCount(creditCards.length)}</p>
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
            className={cn(
              "p-4 flex items-center gap-4 hover:bg-accent/50 transition-colors cursor-pointer border-border/50",
              selectedCreditCardId === card.id ? "border-primary/50 bg-accent/60 ring-1 ring-primary/20" : ""
            )}
            onClick={() => navigate(new ToEditCreditCardRoute(card.id.toString()))}
          >
            <div
              className={`h-12 w-12 rounded-lg flex items-center justify-center ${getColorProps(card.color).className}`}
              style={getColorProps(card.color).style}
            >
              {resolveBankResourceUrl(card.brandLogoUrl) ? (
                <div
                  className="h-full w-full rounded-lg"
                  style={{
                    backgroundImage: `url(${resolveBankResourceUrl(card.brandLogoUrl)})`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                  }}
                />
              ) : (
                <CreditCard className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-foreground truncate">{card.name}</p>
              <p className="text-sm text-muted-foreground">{card.brand}</p>
            </div>
            <div className="text-right flex items-center gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{Lang.commons.limit}</p>
                <p className="text-base font-bold text-foreground">
                  {formatCurrency(card.limit)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export interface CreditCard {
  id: string;
  name: string;
  brand: string;
  brandLogoUrl?: string;
  limit: number;
  color: string;
}

export interface CreditCardsListViewModel {
  navigate: (route: CreditCardsRoute) => void;
  creditCards: CreditCard[];
  selectedCreditCardId?: string;
}

// Navigation Routes
export class CreditCardsRoute {}

export class ToMoreRoute extends CreditCardsRoute {}
export class ToCreateCreditCardRoute extends CreditCardsRoute {}
export class ToEditCreditCardRoute extends CreditCardsRoute {
  constructor(public cardId: string) { super() }
}
