import { useState } from "react";
import {
  Bot,
  Compass,
  Info,
  MessageSquareText,
  Pencil,
  Search,
  Trash2,
  WandSparkles,
  X,
} from "lucide-react";

import { Badge } from "@components/ui/badge";
import { Card } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { cn } from "@lib/utils";
import type { AssistantTimelineEntry } from "@pages/assistant/assistantHistoryAdapter";

interface AssistantTimelineFeedProps {
  entries: AssistantTimelineEntry[];
  mode?: "user" | "developer";
  limit?: number;
  className?: string;
}

export function AssistantTimelineFeed({
  entries,
  mode = "user",
  limit,
  className,
}: AssistantTimelineFeedProps) {
  const visibleEntries = limit ? entries.slice(-limit) : entries;

  return (
    <div className={cn("space-y-3", className)}>
      {visibleEntries.map((entry) => (
        <TimelineEntryCard key={entry.id} entry={entry} mode={mode} />
      ))}
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
    if (entry.toolKind === "ask") {
      return <AssistantToolMessageCard entry={entry} mode={mode} />;
    }
    return <ToolEntryCard entry={entry} mode={mode} />;
  }

  if (entry.type === "system" && mode !== "developer") {
    return null;
  }

  const isUser = entry.type === "user";
  const isAssistant = entry.type === "assistant";
  const isSystem = entry.type === "system";
  const [expanded, setExpanded] = useState(false);
  const shouldClampSystem = isSystem && mode === "developer";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <Card
        className={cn(
          "max-w-3xl border-border/50 px-4 py-3",
          isSystem && "w-full bg-muted/40",
          isUser && "bg-primary text-primary-foreground",
          isAssistant && "bg-accent/40",
        )}
      >
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="outline" className="bg-background/60">
            {isSystem
              ? Lang.visual.assistant.systemLabel
              : isUser
                ? Lang.visual.assistant.userLabel
                : Lang.visual.assistant.assistantLabel}
          </Badge>
          <span className="text-xs opacity-70">{entry.timestamp}</span>
          {shouldClampSystem && (
            <button
              type="button"
              className="ml-auto flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
              onClick={() => setExpanded((current) => !current)}
              aria-label={Lang.visual.assistant.developerDetailsLabel}
            >
              {expanded ? <X className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
        <div className={cn(shouldClampSystem && !expanded && "max-h-20 overflow-hidden")}>
          <p className="whitespace-pre-wrap text-sm leading-6">{entry.content}</p>
        </div>
      </Card>
    </div>
  );
}

function AssistantToolMessageCard({
  entry,
  mode,
}: {
  entry: Extract<AssistantTimelineEntry, { type: "tool" }>;
  mode: "user" | "developer";
}) {
  const [expanded, setExpanded] = useState(false);
  const isWarning = entry.status === "warning";

  return (
    <div className="flex justify-start">
      <Card className={cn("max-w-3xl bg-accent/40 px-4 py-3", isWarning ? "border-destructive/40" : "border-border/50")}>
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="outline" className="bg-background/60">
            {Lang.visual.assistant.assistantLabel}
          </Badge>
          <span className="text-xs opacity-70">{entry.timestamp}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6">{entry.description}</p>
        {mode === "developer" && (
          <>
            <Separator className="my-3" />
            <div className="space-y-2">
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
                onClick={() => setExpanded((current) => !current)}
                aria-label={Lang.visual.assistant.developerDetailsLabel}
              >
                {expanded ? <X className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
              </button>
              {expanded && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{Lang.visual.assistant.toolNameLabel}:</span>{" "}
                    <span className="font-mono text-xs">{entry.toolName}</span>
                  </p>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <DeveloperBlock title={Lang.visual.assistant.rawArgumentsLabel} content={JSON.stringify(entry.arguments ?? {}, null, 2)} mono />
                    <DeveloperBlock title={Lang.visual.assistant.rawResultLabel} content={JSON.stringify(entry.result ?? {}, null, 2)} mono />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
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
  if (mode === "user") {
    return <CompactToolEntryRow entry={entry} />;
  }

  const [expanded, setExpanded] = useState(false);
  const isWarning = entry.status === "warning";
  const Icon = getToolIcon(entry.toolKind);

  return (
    <Card className={cn("bg-muted/10 p-3", isWarning ? "border-destructive/40" : "border-border/40")}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
            isWarning ? "bg-destructive/10 text-destructive" : "bg-primary/8 text-primary/70",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">
                <span className="font-medium">{entry.title}</span>
                <span className="text-muted-foreground"> · {entry.description}</span>
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {entry.chips && entry.chips.length > 0 && (
                <div className="flex flex-wrap justify-end gap-1.5">
                  {entry.chips.map((chip) => (
                    <span key={chip} className="text-[11px] text-muted-foreground">
                      {chip}
                    </span>
                  ))}
                </div>
              )}
              <span className="whitespace-nowrap text-[11px] text-muted-foreground">{entry.timestamp}</span>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
                onClick={() => setExpanded((current) => !current)}
                aria-label={Lang.visual.assistant.developerDetailsLabel}
              >
                {expanded ? <X className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {expanded && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{Lang.visual.assistant.toolNameLabel}:</span>{" "}
                  <span className="font-mono text-xs">{entry.toolName}</span>
                </p>
                <div className="grid gap-3 lg:grid-cols-2">
                  <DeveloperBlock title={Lang.visual.assistant.rawArgumentsLabel} content={JSON.stringify(entry.arguments ?? {}, null, 2)} mono />
                  <DeveloperBlock title={Lang.visual.assistant.rawResultLabel} content={JSON.stringify(entry.result ?? {}, null, 2)} mono />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function CompactToolEntryRow({
  entry,
}: {
  entry: Extract<AssistantTimelineEntry, { type: "tool" }>;
}) {
  const Icon = getToolIcon(entry.toolKind);
  const isWarning = entry.status === "warning";

  return (
    <div className="mx-6 py-1.5 sm:mx-10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <div
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center",
              isWarning ? "text-destructive" : "text-primary/55",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <span className="whitespace-nowrap pt-0.5 text-[11px] text-muted-foreground">{entry.timestamp}</span>
          <div className="min-w-0">
            <p className="truncate text-xs text-muted-foreground">{entry.description}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
          {entry.chips && entry.chips.length > 0 && (
            <div className="flex items-center gap-1.5">
              {entry.chips.map((chip) => (
                <span key={chip} className="whitespace-nowrap">
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
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
