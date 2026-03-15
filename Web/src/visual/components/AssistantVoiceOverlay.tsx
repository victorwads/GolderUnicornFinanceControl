import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import { Send, StopCircle, X } from "lucide-react";

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
  autoSendProgress: number;
  isAssistantThinking: boolean;
  hasStarted: boolean;
  assistantHasAppeared: boolean;
  isLiveMode: boolean;
  onUserTextChange: (value: string) => void;
  onUserTextClick: () => void;
  onStopOrClear: () => void;
  onSend: () => void;
}

export default function AssistantVoiceOverlay({
  state,
  userText,
  assistantText,
  infoBalloons,
  autoSendProgress,
  isAssistantThinking,
  hasStarted,
  assistantHasAppeared,
  isLiveMode,
  onUserTextChange,
  onUserTextClick,
  onStopOrClear,
  onSend,
}: AssistantVoiceOverlayProps) {
  return (
    <>
      <div className="flex flex-col items-center gap-2 mb-4 max-h-[40vh] overflow-hidden pointer-events-none">
        {infoBalloons.map((balloon) => (
          <div
            key={balloon.id}
            className="animate-fade-in bg-muted/90 backdrop-blur-md border border-border/50 rounded-2xl px-4 py-2 shadow-lg"
          >
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">info:</span> {balloon.text}
            </p>
          </div>
        ))}
      </div>

      {assistantHasAppeared && (
        <div className="animate-fade-in bg-primary/10 backdrop-blur-md border border-primary/30 rounded-2xl px-4 py-3 mb-3 max-w-[85vw] shadow-lg pointer-events-none">
          <p className="text-sm text-foreground mb-2">
            <span className="font-semibold text-primary">assistente:</span>{" "}
            {isAssistantThinking ? (
              <pre className="inline font-mono text-muted-foreground">hmm…</pre>
            ) : (
              assistantText
            )}
          </p>
          {!isAssistantThinking && assistantText && (
            <p className="text-xs text-muted-foreground italic mt-2 border-t border-primary/20 pt-2">
              Responda pelo microfone ou escreva para continuar.
            </p>
          )}
        </div>
      )}

      {hasStarted && (
        <div className="animate-fade-in bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl px-4 py-3 mb-4 max-w-[85vw] shadow-lg flex items-start gap-3 pointer-events-auto">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground mb-1">você:</p>
            <Textarea
              value={userText}
              onChange={(event) => onUserTextChange(event.target.value)}
              onClick={onUserTextClick}
              disabled={state !== "listening" && state !== "paused"}
              className="min-h-[60px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm resize-none disabled:opacity-50"
              placeholder={state === "listening" ? "Falando..." : ""}
            />
          </div>

          <div className="flex items-center gap-2">
            {(state === "listening" || state === "paused") && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full bg-destructive/20 hover:bg-destructive/30 text-destructive"
                onClick={onStopOrClear}
              >
                {state === "listening" ? (
                  <StopCircle className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            )}

            {(state === "listening" || state === "paused" || state === "sending") && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full hover:bg-primary/20 text-primary relative overflow-hidden"
                onClick={onSend}
                disabled={state === "sending" || !userText}
              >
                <Send className="h-4 w-4 relative z-10" />
                {isLiveMode && state === "paused" && (
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
        </div>
      )}
    </>
  );
}

export type { InfoBalloon };
