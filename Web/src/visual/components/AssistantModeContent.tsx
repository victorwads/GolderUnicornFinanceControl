import { useState } from "react";
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
  variant?: "cards" | "radio";
}

export default function AssistantModeContent({ variant = "cards" }: AssistantModeContentProps) {
  const [selectedMode, setSelectedMode] = useState("live");
  const [micMode, setMicMode] = useState("click");
  const LocalLang = Lang.settings;

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
                selectedMode === mode.id ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => setSelectedMode(mode.id)}
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
                    {selectedMode === mode.id && (
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
      <div className="space-y-4">
        <Label className="text-sm font-medium">{LocalLang.microphoneMode.title}</Label>
        <div className="grid gap-4">
          {micModes.map((mode) => {
            const Icon = mode.icon;
            const localized = localizedMicModes[mode.id as keyof typeof localizedMicModes];
            return (
              <Card
                key={mode.id}
                className={`p-6 cursor-pointer transition-all hover:border-primary ${
                  micMode === mode.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setMicMode(mode.id)}
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
                      {micMode === mode.id && (
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
      </div>
    </div>
  );
}
