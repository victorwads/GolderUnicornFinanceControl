import { useState } from "react";
import { Card } from "@components/ui/card";
import { Check, Mic, Hand, MousePointerClick } from "lucide-react";
import { Label } from "@components/ui/label";

const modes = [
  {
    id: "live",
    name: "Modo Live",
    description: "O assistente escuta continuamente e responde automaticamente quando você para de falar. Ideal para conversas naturais e fluidas.",
    icon: Mic,
  },
  {
    id: "manual",
    name: "Modo Manual",
    description: "Você controla quando o assistente deve escutar. Pressione o botão do microfone para falar e novamente para enviar. Mais controle e privacidade.",
    icon: Hand,
  }
];

const micModes = [
  {
    id: "hold",
    name: "Segurar para falar",
    description: "Pressione e segure o botão enquanto fala",
    icon: Hand,
  },
  {
    id: "click",
    name: "Clique para começar / Clique para parar",
    description: "Clique uma vez para iniciar, clique novamente para finalizar",
    icon: MousePointerClick,
  }
];

interface AssistantModeContentProps {
  variant?: "cards" | "radio";
}

export default function AssistantModeContent({ variant = "cards" }: AssistantModeContentProps) {
  const [selectedMode, setSelectedMode] = useState("live");
  const [micMode, setMicMode] = useState("click");

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Modo do assistente</Label>
      <div className="grid gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
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
                      {mode.name}
                    </h3>
                    {selectedMode === mode.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="space-y-4">
        <Label className="text-sm font-medium">Modo do microfone</Label>
        <div className="grid gap-4">
          {micModes.map((mode) => {
            const Icon = mode.icon;
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
                        {mode.name}
                      </h3>
                      {micMode === mode.id && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
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
