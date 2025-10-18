import { Button } from "@components/ui/button";
import { Mic } from "lucide-react";
import AssistantModeContent from "@components/AssistantModeContent";

interface AssistantModeProps {
  model: AssistantModeViewModel;
}

export default function AssistantMode({ model }: AssistantModeProps) {
  const { handleComplete } = model;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card rounded-2xl p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Mic className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Escolha o Modo do Assistente</h2>
          <p className="text-muted-foreground">
            Selecione como você prefere interagir com o assistente de voz. Você pode mudar isso depois nas configurações.
          </p>
        </div>

        <AssistantModeContent variant="cards" />

        <div className="pt-4">
          <Button onClick={handleComplete} className="w-full">
            Começar a usar
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface AssistantModeViewModel {
  navigate: (path: string) => void;
  handleComplete: () => void;
}
