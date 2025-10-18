import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Mic, CreditCard, Wallet, Tag, Calendar } from "lucide-react";

const features = [
  { icon: Wallet, title: "Contas Bancárias", description: "Configure suas contas e saldos iniciais" },
  { icon: CreditCard, title: "Cartões de Crédito", description: "Adicione seus cartões e limites" },
  { icon: Tag, title: "Categorias", description: "Organize suas despesas por categoria" },
  { icon: Calendar, title: "Recorrências", description: "Configure pagamentos e receitas recorrentes" }
];

interface VoiceAssistantIntroProps {
  model: VoiceAssistantIntroViewModel;
}

export default function VoiceAssistantIntro({ model }: VoiceAssistantIntroProps) {
  const { handleStartWithAssistant, handleSetupLater } = model;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card rounded-2xl p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Mic className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Configure tudo com o Assistente de Voz!</h2>
          <p className="text-muted-foreground">
            Agora que está tudo pronto, você pode usar o assistente de voz para configurar 
            rapidamente todos os dados iniciais da sua conta.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-center">O assistente pode ajudar com:</p>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-center">
            <span className="font-medium">Dica:</span> Basta clicar no microfone na tela inicial e dizer 
            o que deseja configurar. O assistente vai te guiar em cada etapa!
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Button onClick={handleStartWithAssistant} className="w-full" size="lg">
            <Mic className="h-4 w-4 mr-2" />
            Começar com o Assistente
          </Button>
          <Button onClick={handleSetupLater} variant="outline" className="w-full">
            Configurar depois
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface VoiceAssistantIntroViewModel {
  navigate: (path: string) => void;
  handleStartWithAssistant: () => void;
  handleSetupLater: () => void;
}
