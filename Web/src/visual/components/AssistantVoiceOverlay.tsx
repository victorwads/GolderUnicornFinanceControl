import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { AssistantTimelineFeed } from "@components/AssistantTimelineFeed";
import type { AssistantTimelineEntry } from "@pages/assistant/assistantHistoryAdapter";
import { Send } from "lucide-react";
import { useEffect, useRef } from "react";

export type AssistantVoiceOverlayState =
  | "idle"
  | "listening"
  | "paused"
  | "sending"
  | "thinking"
  | "responded";

interface InfoBalloon {
  id: string;
  text: string;
}

interface AssistantVoiceOverlayProps {
  state: AssistantVoiceOverlayState;
  userText: string;
  assistantText: string;
  infoBalloons: InfoBalloon[];
  entries?: AssistantTimelineEntry[];
  entryLimit?: number;
  autoSendProgress: number;
  isAssistantThinking: boolean;
  isSendLocked?: boolean;
  hasStarted: boolean;
  assistantHasAppeared: boolean;
  isLiveMode: boolean;
  onUserTextChange: (value: string) => void;
  onUserTextClick: () => void;
  onUserTextKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  showControls?: boolean;
}

export default function AssistantVoiceOverlay({
  state,
  userText,
  assistantText,
  infoBalloons,
  entries,
  entryLimit = 8,
  autoSendProgress,
  isAssistantThinking,
  isSendLocked = false,
  hasStarted,
  assistantHasAppeared,
  isLiveMode,
  onUserTextChange,
  onUserTextClick,
  onUserTextKeyDown,
  onSend,
  showControls = true,
}: AssistantVoiceOverlayProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const texts = Lang.assistant.voiceOverlay;
  const hasTimelineEntries = Boolean(entries && entries.length > 0);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const collapsedHeight = 22;
    const maxHeight = 160;
    textarea.style.height = "auto";
    const nextHeight = userText.trim() ? Math.min(textarea.scrollHeight, maxHeight) : collapsedHeight;
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    textarea.scrollTop = textarea.scrollHeight;
  }, [userText]);

  return (
    <>
      {hasTimelineEntries ? (
        <div className="mb-4 max-h-[42vh] w-[min(92vw,32rem)] overflow-hidden pointer-events-auto">
          <div className="max-h-[42vh] overflow-y-auto rounded-3xl border border-border/40 bg-background/45 p-3 backdrop-blur-md shadow-lg">
            <AssistantTimelineFeed entries={entries ?? []} limit={entryLimit} className="space-y-2" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 mb-4 max-h-[40vh] overflow-hidden pointer-events-none">
          {infoBalloons.map((balloon) => (
            <div
              key={balloon.id}
              className="animate-fade-in bg-muted/90 backdrop-blur-md border border-border/50 rounded-2xl px-4 py-2 shadow-lg"
            >
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">{texts.infoLabel}</span> {balloon.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {!hasTimelineEntries && assistantHasAppeared && (
        <div className="animate-fade-in bg-primary/10 backdrop-blur-md border border-primary/30 rounded-2xl px-4 py-3 mb-3 max-w-[85vw] shadow-lg pointer-events-none">
          <p className="text-sm text-foreground mb-2">
            <span className="font-semibold text-primary">{texts.assistantLabel}</span>{" "}
            {isAssistantThinking ? (
              <pre className="inline font-mono text-muted-foreground">hmm…</pre>
            ) : (
              assistantText
            )}
          </p>
          {!isAssistantThinking && assistantText && (
            <p className="text-xs text-muted-foreground italic mt-2 border-t border-primary/20 pt-2">
              {texts.continuePrompt}
            </p>
          )}
        </div>
      )}

      {true && (
        <div className="animate-fade-in bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl px-4 py-3 mb-4 w-[min(85vw,28rem)] shadow-lg pointer-events-auto">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-sm font-semibold text-foreground">{texts.userLabel}</p>
            {showControls && (state !== "sending" || Boolean(userText.trim())) && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full hover:bg-primary/20 text-primary relative overflow-hidden shrink-0"
                onClick={onSend}
                disabled={isSendLocked || !userText.trim()}
              >
                <Send className="h-4 w-4 relative z-10" />
                {isLiveMode && state !== "sending" && (
                  <div
                    className="absolute inset-0 bg-primary/20 transition-all duration-100"
                    style={{ width: `${autoSendProgress}%` }}
                  />
                )}
                {state === "sending" && (
                  <div
                    className="absolute inset-0 bg-primary/30 transition-all duration-300"
                    style={{ width: `${autoSendProgress}%` }}
                  />
                )}
              </Button>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={userText}
              onChange={(event) => onUserTextChange(event.target.value)}
              onClick={onUserTextClick}
              onKeyDown={onUserTextKeyDown}
              disabled={false}
              rows={1}
              className="min-h-0 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm leading-6 resize-none"
              placeholder={state === "listening" ? texts.listeningPlaceholder : texts.inputPlaceholder}
            />
          </div>
        </div>
      )}
    </>
  );
}

export type { InfoBalloon };
