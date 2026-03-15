import { ArrowLeft, Bot, ChevronRight, Cpu, TriangleAlert } from "lucide-react";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Progress } from "@components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { cn } from "@lib/utils";

import type { AssistantHistoryConversation } from "@pages/assistant/assistantHistoryAdapter";

export default function AssistantHistoryList({
  model: {
    navigate,
    conversations,
    selectedConversationId,
    monthlyUsage,
    isDeveloperMode,
    modelOptions,
    selectedModel,
    onModelChange,
  },
  embedded = false,
}: {
  model: AssistantHistoryListViewModel;
  embedded?: boolean;
}) {
  const LocalLang = Lang.visual.assistant;

  return (
    <div className={cn("mx-auto", embedded ? "min-h-full" : "max-w-5xl")}>
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(new ToMoreRoute())}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{LocalLang.aiCallsTitle}</h1>
              <Badge variant="secondary">{conversations.length}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{LocalLang.aiCallsSubtitle}</p>
          </div>
        </div>
      </header>

      <div className="space-y-4 p-4 animate-fade-in">
        <Card className="border-border/50 bg-gradient-card p-4">
          <div className="space-y-4 rounded-2xl border border-border/50 bg-background/80 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {LocalLang.monthlyBudgetLabel}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrencyBRL(monthlyUsage.currentCostBRL)} / {formatCurrencyBRL(monthlyUsage.limitBRL)}
                </p>
              </div>
              {isDeveloperMode && (
                <div className="w-full max-w-[240px] space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    <Cpu className="h-3.5 w-3.5" />
                    {LocalLang.modelSelectorLabel}
                  </div>
                  <Select value={selectedModel} onValueChange={onModelChange}>
                    <SelectTrigger className="h-10 bg-card">
                      <SelectValue placeholder={LocalLang.modelSelectorLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      {modelOptions.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Progress value={monthlyUsage.progressPercent} className="h-2" />
              <p className="text-sm text-muted-foreground">{LocalLang.monthlyBudgetDescription}</p>
              {monthlyUsage.exceededAmountBRL !== null && (
                <p className="text-xs font-medium text-destructive">
                  {LocalLang.monthlyBudgetExceeded(formatCurrencyBRL(monthlyUsage.exceededAmountBRL))}
                </p>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {conversations.map((conversation) => {
            const isSelected = selectedConversationId === conversation.id;

            return (
              <Card
                key={conversation.id}
                className={cn(
                  "cursor-pointer border-border/50 p-4 transition-all hover:border-primary/40 hover:bg-accent/40",
                  isSelected && "border-primary/50 bg-accent/50 ring-1 ring-primary/20"
                )}
                onClick={() => navigate(new ToConversationRoute(conversation.id))}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-semibold text-foreground">{conversation.title}</h2>
                      <Badge variant="outline">{conversation.model}</Badge>
                      {conversation.warningsCount > 0 && (
                        <Badge variant="outline" className="border-amber-500/40 text-amber-700">
                          <TriangleAlert className="mr-1 h-3.5 w-3.5" />
                          {conversation.warningsCount}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">{conversation.preview}</p>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{conversation.timestampLabel}</span>
                      <span>•</span>
                      <span>{conversation.relativeTime}</span>
                      <span>•</span>
                      <span>{LocalLang.costLabel} R$ {conversation.cost.toFixed(4)}</span>
                      <span>•</span>
                      <span>{conversation.toolCallsCount} {LocalLang.actionsLabel}</span>
                    </div>
                  </div>
                  <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export interface AssistantHistoryListViewModel {
  navigate: (route: AssistantHistoryRoute) => void;
  conversations: AssistantHistoryConversation[];
  selectedConversationId?: string;
  monthlyUsage: {
    currentCostBRL: number;
    limitBRL: number;
    progressPercent: number;
    exceededAmountBRL: number | null;
  };
  isDeveloperMode: boolean;
  modelOptions: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export class AssistantHistoryRoute {}

export class ToMoreRoute extends AssistantHistoryRoute {}

export class ToConversationRoute extends AssistantHistoryRoute {
  constructor(public conversationId: string) {
    super();
  }
}

function formatCurrencyBRL(value: number) {
  return value.toLocaleString(CurrentLangInfo.short, {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: value > 1 ? 2 : 4,
    maximumFractionDigits: 4,
  });
}
