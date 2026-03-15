import { useState } from "react";
import {
  ArrowLeft,
  Bot,
  ChevronDown,
  ChevronUp,
  Code2,
  Compass,
  MessageSquareText,
  Pencil,
  Search,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";

import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { cn } from "@lib/utils";

import type {
  AssistantTimelineEntry,
  MockAssistantConversation,
} from "@pages/assistant/mockAssistantHistory";

export default function AssistantHistoryDetail({
  model: { navigate, conversation },
}: {
  model: AssistantHistoryDetailViewModel;
}) {
  const LocalLang = Lang.visual.assistant;
  const [mode, setMode] = useState<"user" | "developer">("user");

  return (
    <div className="min-h-full bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(new ToAssistantListRoute())}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-bold text-foreground">{conversation.title}</h1>
                <Badge variant="secondary">{conversation.model}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{conversation.timestampLabel}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ModeButton
              active={mode === "user"}
              onClick={() => setMode("user")}
              icon={Sparkles}
              label={LocalLang.userModeLabel}
            />
            <ModeButton
              active={mode === "developer"}
              onClick={() => setMode("developer")}
              icon={Code2}
              label={LocalLang.developerModeLabel}
            />
            <div className="ml-auto flex flex-wrap gap-2">
              <Badge variant="outline">{LocalLang.costLabel} R$ {conversation.cost.toFixed(4)}</Badge>
              <Badge variant="outline">{LocalLang.tokenLabel} {conversation.tokensIn + conversation.tokensOut}</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-4 p-4 animate-fade-in">
        <Card className="border-border/50 bg-gradient-card p-5">
          <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{LocalLang.summaryLabel}</p>
              <p className="text-base leading-7 text-foreground">
                {mode === "user" ? conversation.userSummary : conversation.developerSummary}
              </p>
              <div className="flex flex-wrap gap-2">
                {conversation.sharedDomains.map((domain) => (
                  <Badge key={domain} variant="secondary">{domain}</Badge>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <MetricCard label={LocalLang.actionsLabel} value={String(conversation.toolCallsCount)} />
              <MetricCard label={LocalLang.finishReasonLabel} value={conversation.finishReason} />
              <MetricCard label={LocalLang.inputTokensLabel} value={String(conversation.tokensIn)} />
              <MetricCard label={LocalLang.outputTokensLabel} value={String(conversation.tokensOut)} />
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {conversation.entries.map((entry) => (
            <TimelineEntryCard key={entry.id} entry={entry} mode={mode} />
          ))}
        </div>

        <Card className="border-dashed border-border/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{LocalLang.resumeConversationTitle}</p>
              <p className="text-sm text-muted-foreground">{LocalLang.resumeConversationDescription}</p>
            </div>
            <Button>{LocalLang.resumeConversationAction}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Sparkles;
  label: string;
}) {
  return (
    <Button variant={active ? "default" : "outline"} onClick={onClick} className="gap-2">
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background/80 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function TimelineEntryCard({
  entry,
  mode,
}: {
  entry: AssistantTimelineEntry;
  mode: "user" | "developer";
}) {
  if (entry.type === "tool") {
    return <ToolEntryCard entry={entry} mode={mode} />;
  }

  const isUser = entry.type === "user";
  const isAssistant = entry.type === "assistant";

  return (
    <div className={cn("flex", isAssistant ? "justify-end" : "justify-start")}>
      <Card
        className={cn(
          "max-w-3xl border-border/50 px-4 py-3",
          entry.type === "system" && "w-full bg-muted/40",
          isUser && "bg-primary text-primary-foreground",
          isAssistant && "bg-accent/40"
        )}
      >
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="outline" className="bg-background/60">
            {entry.type === "system"
              ? Lang.visual.assistant.systemLabel
              : isUser
                ? Lang.visual.assistant.userLabel
                : Lang.visual.assistant.assistantLabel}
          </Badge>
          <span className="text-xs opacity-70">{entry.timestamp}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6">{entry.content}</p>
      </Card>
    </div>
  );
}

function ToolEntryCard({
  entry,
  mode,
}: {
  entry: Extract<AssistantTimelineEntry, { type: "tool" }>;
  mode: "user" | "developer";
}) {
  const [expanded, setExpanded] = useState(mode === "developer");

  const Icon = getToolIcon(entry.toolKind);

  return (
    <Card className="border-border/50 p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{Lang.visual.assistant.actionBadgeLabel}</Badge>
            <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
            {entry.status === "warning" && (
              <Badge variant="outline" className="border-amber-500/40 text-amber-700">
                warning
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">{entry.title}</h3>
            <p className="text-sm text-muted-foreground">{entry.description}</p>
          </div>

          {entry.chips && entry.chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.chips.map((chip) => (
                <Badge key={chip} variant="outline">{chip}</Badge>
              ))}
            </div>
          )}

          {mode === "developer" && (
            <>
              <Separator />
              <div className="space-y-2">
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                  onClick={() => setExpanded((current) => !current)}
                >
                  {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {Lang.visual.assistant.developerDetailsLabel}
                </button>
                {expanded && (
                  <div className="grid gap-3 lg:grid-cols-2">
                    <DeveloperBlock title={Lang.visual.assistant.toolNameLabel} content={entry.toolName} />
                    <DeveloperBlock title={Lang.visual.assistant.argumentsPreviewLabel} content={entry.argumentsPreview ?? "-"} />
                    <DeveloperBlock title={Lang.visual.assistant.resultPreviewLabel} content={entry.resultPreview ?? "-"} />
                    <DeveloperBlock title={Lang.visual.assistant.rawArgumentsLabel} content={JSON.stringify(entry.arguments ?? {}, null, 2)} mono />
                    <DeveloperBlock title={Lang.visual.assistant.rawResultLabel} content={JSON.stringify(entry.result ?? {}, null, 2)} mono />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function DeveloperBlock({
  title,
  content,
  mono = false,
}: {
  title: string;
  content: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-muted/20 p-3">
      <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      <pre className={cn("whitespace-pre-wrap break-words text-sm text-foreground", mono && "font-mono text-xs")}>
        {content}
      </pre>
    </div>
  );
}

function getToolIcon(kind: AssistantTimelineEntry extends never ? never : string) {
  switch (kind) {
    case "search":
      return Search;
    case "navigate":
      return Compass;
    case "create":
      return WandSparkles;
    case "update":
      return Pencil;
    case "delete":
      return Trash2;
    case "ask":
      return MessageSquareText;
    case "finish":
    default:
      return Bot;
  }
}

export interface AssistantHistoryDetailViewModel {
  navigate: (route: AssistantHistoryDetailRoute) => void;
  conversation: MockAssistantConversation;
}

export class AssistantHistoryDetailRoute {}

export class ToAssistantListRoute extends AssistantHistoryDetailRoute {}
