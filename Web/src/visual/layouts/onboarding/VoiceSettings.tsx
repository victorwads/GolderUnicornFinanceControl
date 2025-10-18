import { Button } from "@components/ui/button";
import { Volume2 } from "lucide-react";
import VoiceSettingsContent from "@components/VoiceSettingsContent";

interface VoiceSettingsProps {
  model: VoiceSettingsViewModel;
}

export default function VoiceSettings({ model }: VoiceSettingsProps) {
  const { handleContinue } = model;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Volume2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Configurar Voz</h2>
          <p className="text-muted-foreground">
            Ajuste a velocidade da fala e escolha a voz que preferir para as respostas do assistente.
          </p>
        </div>

        <VoiceSettingsContent />

        <div className="pt-4">
          <Button onClick={handleContinue} className="w-full">
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface VoiceSettingsViewModel {
  navigate: (path: string) => void;
  handleContinue: () => void;
}
