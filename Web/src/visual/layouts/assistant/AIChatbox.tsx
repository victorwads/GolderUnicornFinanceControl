import { useEffect, useRef } from "react";
import { Bot, Expand, Mic, PanelLeftClose, SendHorizontal } from "lucide-react";

import { AssistantTimelineFeed } from "@components/AssistantTimelineFeed";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { cn } from "@lib/utils";
import type { AssistantHistoryConversation } from "@pages/assistant/assistantHistoryAdapter";

interface AIChatboxProps {
  model: AIChatboxViewModel;
}

export default function AIChatbox({ model }: AIChatboxProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const entries = model.visibleEntries;
  const canOpenFullConversation = Boolean(model.conversationId && entries.length > 0);
  const isCompactActive = !model.open && model.isActive;
  const shouldRender = model.open || isCompactActive;
  const autoSendProgress = normalizeProgress(model.autoSendProgress);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries, model.loading, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-3 bottom-24 top-3 z-40 transition-all duration-300 lg:inset-y-5 lg:left-5 lg:right-auto",
        "translate-y-0 opacity-100"
      )}
      aria-hidden={false}
    >
      <aside
        className={cn(
          "flex h-full w-full flex-col lg:w-[26rem]",
          "transition-all duration-300",
          model.open
            ? "pointer-events-auto overflow-hidden rounded-[2rem] border border-border/40 bg-background/80 shadow-[0_24px_80px_rgba(15,23,42,0.14)] scale-100"
            : "pointer-events-none overflow-visible bg-transparent shadow-none justify-end"
        )}
      >
        {model.open && (
          <div className="flex items-center justify-between px-3 pb-1 pt-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-2xl bg-background/70 backdrop-blur-sm"
                onClick={model.onClose}
                aria-label={Lang.assistant.voiceOverlay.closeLabel}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Bot className="h-4 w-4" />
              </div>
            </div>
            {canOpenFullConversation ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-2xl bg-background/70 backdrop-blur-sm"
                onClick={model.onOpenFullConversation}
              >
                <Expand className="h-4 w-4" />
              </Button>
            ) : (
              <div className="h-9 w-9" aria-hidden="true" />
            )}
          </div>
        )}

        <div
          ref={scrollRef}
          className={cn(
            "min-h-0 px-3 pt-1",
            model.open
              ? "pointer-events-auto flex-1 overflow-y-auto pb-3"
              : "pointer-events-none flex-none overflow-hidden pb-2"
          )}
        >
          <div className="flex min-h-full flex-col justify-end">
            {entries.length > 0 ? (
              <>
                <AssistantTimelineFeed entries={entries} className="space-y-2" session />
                {model.loading ? (
                  <div className="flex items-center justify-center py-2">
                    <ThinkingLoader />
                  </div>
                ) : null}
              </>
            ) : model.open ? (
              <div className="mx-auto flex min-h-full max-w-[20rem] flex-col items-center justify-end pb-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Bot className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-foreground">{Lang.visual.assistant.assistantLabel}</p>
              </div>
            ) : null}
            {entries.length === 0 && model.loading ? (
              <div className="flex items-center justify-center py-2">
                <ThinkingLoader />
              </div>
            ) : null}
          </div>
        </div>

        <div className="pointer-events-auto px-3 pb-3 pt-1">
          <div
            className={cn(
              "rounded-[1.8rem] p-3 transition-all duration-300",
              model.open
                ? "border border-border/50 bg-background/92 shadow-sm"
                : "border border-border/20 bg-background/70 shadow-[0_10px_30px_rgba(15,23,42,0.10)] backdrop-blur-sm"
            )}
          >
            <Textarea
              value={model.draft}
              onChange={(event) => model.onDraftChange(event.target.value)}
              rows={2}
              className="min-h-[4.5rem] resize-none border-none bg-transparent p-0 text-sm leading-6 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder={Lang.assistant.voiceOverlay.inputPlaceholder}
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "relative h-9 w-9 rounded-2xl transition-all duration-200",
                    model.isListening
                      ? "bg-destructive/12 text-destructive hover:bg-destructive/18"
                      : "bg-primary/8 text-primary hover:bg-primary/12"
                  )}
                  onClick={model.toggleMic}
                  onMouseDown={model.onMicrophonePressStart}
                  onMouseUp={model.onMicrophonePressEnd}
                  onMouseLeave={model.onMicrophonePressEnd}
                  onTouchStart={model.onMicrophonePressStart}
                  onTouchEnd={model.onMicrophonePressEnd}
                  onTouchCancel={model.onMicrophonePressEnd}
                  title={model.isListening ? Lang.assistant.micStop : Lang.assistant.micStart}
                  aria-label={model.isListening ? Lang.assistant.micStop : Lang.assistant.micStart}
                >
                  {model.isListening ? (
                    <>
                      <span className="absolute inset-0 rounded-2xl bg-destructive/15 animate-pulse" aria-hidden="true" />
                      <span className="relative z-10 flex h-3 w-3 rounded-full bg-destructive" aria-hidden="true" />
                    </>
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  className="relative h-10 w-10 overflow-hidden rounded-2xl"
                  disabled={!model.draft.trim() || model.loading}
                  onClick={model.onSend}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-primary-foreground/20 transition-all duration-150"
                    style={{ width: `${autoSendProgress}%` }}
                  />
                  <SendHorizontal className="relative z-10 h-4 w-4" />
                  <div
                    className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary-foreground/10"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export interface AIChatboxViewModel {
  open: boolean;
  isActive: boolean;
  conversationId: string | null;
  visibleEntries: AssistantHistoryConversation["entries"];
  draft: string;
  isListening: boolean;
  autoSendProgress: number;
  loading: boolean;
  onDraftChange: (value: string) => void;
  toggleMic: () => void;
  onMicrophonePressStart: () => void;
  onMicrophonePressEnd: () => void;
  onClose: () => void;
  onToggle: () => void;
  onSend: () => void;
  onOpenFullConversation: () => void;
}

function ThinkingLoader() {
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-[thinking-wave_0.9s_cubic-bezier(0.55,0,0.45,1)_infinite_alternate]" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-[thinking-wave_0.9s_cubic-bezier(0.55,0,0.45,1)_infinite_alternate] [animation-delay:0.09s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-[thinking-wave_0.9s_cubic-bezier(0.55,0,0.45,1)_infinite_alternate] [animation-delay:0.18s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-[thinking-wave_0.9s_cubic-bezier(0.55,0,0.45,1)_infinite_alternate] [animation-delay:0.27s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-[thinking-wave_0.9s_cubic-bezier(0.55,0,0.45,1)_infinite_alternate] [animation-delay:0.36s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary/80 animate-[thinking-wave_0.9s_cubic-bezier(0.55,0,0.45,1)_infinite_alternate] [animation-delay:0.45s]" />
    </div>
  );
}

function normalizeProgress(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const normalized = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, normalized));
}
