import { ArrowLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Progress } from "@components/ui/progress";
import { Badge } from "@components/ui/badge";

interface ResourceUsageProps {
  model: ResourceUsageViewModel;
}

export default function ResourceUsage({ model }: ResourceUsageProps) {
  const LocalLang = Lang.visual.settings.resourceUsage;
  const {
    navigate,
    aiModels,
    databases,
    monthlyUsage,
    summary,
  } = model;

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(new ToMoreRoute())}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{LocalLang.title}</h1>
                <Badge variant="secondary" className="text-xs">{LocalLang.beta}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{LocalLang.subtitle}</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          {/* Consumo mensal de IA */}
          <Card className="p-5 border-border/50 bg-gradient-card">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{LocalLang.monthlyAiUsage}</h3>
                <span className="text-sm font-medium text-foreground">
                  {formatCurrencyBRL(monthlyUsage.currentCostBRL)} / {formatCurrencyBRL(monthlyUsage.limitBRL)}
                </span>
              </div>
              <Progress value={monthlyUsage.progressPercent} className="h-2" />
              {monthlyUsage.exceededAmountBRL !== null && (
                <p className="text-xs font-medium text-destructive">
                  {LocalLang.exceededBy(formatCurrencyBRL(monthlyUsage.exceededAmountBRL))}
                </p>
              )}
            </div>
          </Card>

          {/* Database */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{LocalLang.database}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {databases.map((database) => (
                <Card key={database.name} className="p-5 border-border/50 bg-card/50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">{database.name}</h4>
                      <Badge variant="outline" className="text-xs">DB</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{LocalLang.reads}</p>
                        <p className="text-lg font-bold text-foreground">
                          {formatNumber(database.reads)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{LocalLang.writes}</p>
                        <p className="text-lg font-bold text-foreground">
                          {formatNumber(database.writes)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">{LocalLang.queryReads}</p>
                        <p className="text-lg font-bold text-foreground">
                          {formatNumber(database.queryReads)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* AI Models */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">{LocalLang.aiModels}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {aiModels.map((model, index) => (
                <Card key={model.name || index} className="p-4 border-border/50 bg-card/50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {model.name}
                      </h4>
                      <Badge variant="outline" className="text-xs">IA</Badge>
                    </div>
                    <div className="space-y-2">
                      {model.requests !== null && (
                        <div>
                          <p className="text-xs text-muted-foreground">{LocalLang.requests}</p>
                          <p className="text-lg font-bold text-foreground">{model.requests}</p>
                        </div>
                      )}
                      {model.tokensIn !== null && (
                        <div>
                          <p className="text-xs text-muted-foreground">{LocalLang.tokensIn}</p>
                          <p className="text-lg font-bold text-foreground">{formatNumber(model.tokensIn)}</p>
                        </div>
                      )}
                      {model.tokensOut !== null && (
                        <div>
                          <p className="text-xs text-muted-foreground">{LocalLang.tokensOut}</p>
                          <p className="text-lg font-bold text-foreground">{formatNumber(model.tokensOut)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <Card className="p-5 border-border/50 bg-gradient-card">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{LocalLang.totalRequests}</p>
                  <p className="text-xl font-bold text-foreground">{formatNumber(summary.totalRequests)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{LocalLang.totalInputTokens}</p>
                  <p className="text-xl font-bold text-foreground">{formatNumber(summary.tokensIn)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{LocalLang.totalOutputTokens}</p>
                  <p className="text-xl font-bold text-foreground">{formatNumber(summary.tokensOut)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{LocalLang.estimatedCost}</p>
                  <p className="text-xl font-bold text-primary">{formatCurrencyBRL(summary.estimatedCostBRL)}</p>
                </div>
              </div>
            </Card>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate(new ToMoreRoute())}
            className="w-full"
          >
            {LocalLang.back}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Navigation Routes
export class ResourceUsageRoute {}

export class ToMoreRoute extends ResourceUsageRoute {}

export interface AIModel {
  name: string;
  requests: number | null;
  tokensIn: number | null;
  tokensOut: number | null;
}

export interface DatabaseUsageCard {
  name: string;
  reads: number;
  writes: number;
  queryReads: number;
}

export interface MonthlyUsageSummary {
  currentCostBRL: number;
  limitBRL: number;
  progressPercent: number;
  exceededAmountBRL: number | null;
}

export interface ResourceUsageSummary {
  totalRequests: number;
  tokensIn: number;
  tokensOut: number;
  estimatedCostBRL: number;
}

export interface ResourceUsageViewModel {
  navigate: (route: ResourceUsageRoute) => void;
  aiModels: AIModel[];
  databases: DatabaseUsageCard[];
  monthlyUsage: MonthlyUsageSummary;
  summary: ResourceUsageSummary;
}

function formatNumber(value: number): string {
  return value.toLocaleString(CurrentLangInfo.short);
}

function formatCurrencyBRL(value: number): string {
  if (!Number.isFinite(value)) return "R$\u00a00,00";
  return value.toLocaleString(CurrentLangInfo.short, {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: value > 1 ? 2 : 4,
    maximumFractionDigits: 4,
  });
}
