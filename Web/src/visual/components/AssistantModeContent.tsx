import { Card } from "@components/ui/card";
import { Check, Mic, Hand, MousePointerClick } from "lucide-react";
import { Label } from "@components/ui/label";

const modes = [
  {
    id: "live",
    icon: Mic,
  },
  {
    id: "manual",
    icon: Hand,
  }
];

const micModes = [
  {
    id: "hold",
    icon: Hand,
  },
  {
    id: "click",
    icon: MousePointerClick,
  }
];

interface AssistantModeContentProps {
  model: AssistantModeContentViewModel;
  variant?: "cards" | "radio";
}

export default function AssistantModeContent({ model, variant = "cards" }: AssistantModeContentProps) {
  const LocalLang = Lang.settings;
  const isManualMode = model.assistantMode === "manual";

  const localizedModes = {
    live: LocalLang.assistantMode.live,
    manual: LocalLang.assistantMode.manual,
  } as const;

  const localizedMicModes = {
    hold: LocalLang.microphoneMode.hold,
    click: LocalLang.microphoneMode.click,
  } as const;

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{LocalLang.assistantMode.title}</Label>
      <div className="grid gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const localized = localizedModes[mode.id as keyof typeof localizedModes];
          return (
            <Card
              key={mode.id}
              className={`p-6 cursor-pointer transition-all hover:border-primary ${
                model.assistantMode === mode.id ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => model.onAssistantModeChange(mode.id as AssistantModeContentViewModel["assistantMode"])}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {localized.name}
                    </h3>
                    {model.assistantMode === mode.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{localized.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {isManualMode && (
        <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium">{LocalLang.microphoneMode.title}</Label>
            <p className="text-sm text-muted-foreground">
              {LocalLang.microphoneMode.helper}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {micModes.map((mode) => {
              const Icon = mode.icon;
              const localized = localizedMicModes[mode.id as keyof typeof localizedMicModes];
              return (
                <Card
                  key={mode.id}
                  className={`p-5 cursor-pointer transition-all hover:border-primary ${
                    model.microphoneMode === mode.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => model.onMicrophoneModeChange(mode.id as AssistantModeContentViewModel["microphoneMode"])}
                >
                  <div className="flex h-full items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-base">
                          {localized.name}
                        </h3>
                        {model.microphoneMode === mode.id && (
                          <Check className="h-5 w-5 shrink-0 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{localized.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export interface AssistantModeContentViewModel {
  assistantMode: "live" | "manual";
  onAssistantModeChange: (mode: "live" | "manual") => void;
  microphoneMode: "hold" | "click";
  onMicrophoneModeChange: (mode: "hold" | "click") => void;
}
