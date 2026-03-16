import type { ReactNode } from "react";
import { Mic, MicOff, X } from "lucide-react";
import { cn } from "@lib/utils";
export interface VoiceAssistantViewModel {
  isVisible: boolean;
  isListening: boolean;
  hasSession: boolean;
  closeLabel: string;
  onToggleMicrophone: () => void;
  onMicrophonePressStart?: () => void;
  onMicrophonePressEnd?: () => void;
  onClose: () => void;
  overlay?: ReactNode;
}

interface VoiceAssistantProps {
  model: VoiceAssistantViewModel;
}

export const VoiceAssistant = ({ model }: VoiceAssistantProps) => {
  if (!model.isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-end pb-20">
      {model.overlay}

      <button
        onClick={model.onToggleMicrophone}
        onMouseDown={model.onMicrophonePressStart}
        onMouseUp={model.onMicrophonePressEnd}
        onMouseLeave={model.onMicrophonePressEnd}
        onTouchStart={model.onMicrophonePressStart}
        onTouchEnd={model.onMicrophonePressEnd}
        onTouchCancel={model.onMicrophonePressEnd}
        className={cn(
          "fixed bottom-14 left-1/2 -translate-x-1/2 z-40 pointer-events-auto",
          "w-16 h-16 rounded-full",
          "flex items-center justify-center",
          "transition-all duration-300 active:scale-95",
          "backdrop-blur-md border",
          model.isListening
            ? "bg-primary/20 border-primary/30 text-primary shadow-[0_8px_32px_hsl(262_83%_58%/0.3)] animate-pulse-slow"
            : "bg-background/20 border-border/30 text-foreground shadow-lg hover:bg-background/30 hover:shadow-xl",
        )}
      >
        <div className="relative">
          {model.isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}

          {model.isListening && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-8 h-8 rounded-full bg-primary/20 animate-ping" />
              <div
                className="absolute w-10 h-10 rounded-full bg-primary/10 animate-ping"
                style={{ animationDelay: "150ms" }}
              />
            </div>
          )}
        </div>
      </button>

      {model.hasSession && (
        <button
          onClick={model.onClose}
          className="fixed bottom-14 left-1/2 translate-x-12 z-40 pointer-events-auto animate-fade-in px-3 py-2 rounded-full bg-destructive/20 hover:bg-destructive/30 backdrop-blur-md border border-destructive/30 text-destructive shadow-lg transition-all duration-300 active:scale-95 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          <span className="text-xs font-medium whitespace-nowrap">{model.closeLabel}</span>
        </button>
      )}
    </div>
  );
};
