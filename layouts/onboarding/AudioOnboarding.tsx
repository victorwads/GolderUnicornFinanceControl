import { Button } from "@components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Mic, MicOff, Volume2, Globe, MessageSquare, CheckCircle } from "lucide-react";

interface AudioOnboardingProps {
  model: AudioOnboardingViewModel;
}

export default function AudioOnboarding({ model }: AudioOnboardingProps) {
  const {
    navigate,
    step,
    selectedLanguage,
    setSelectedLanguage,
    currentPhraseIndex,
    isListening,
    transcription,
    score,
    handleStartTest,
    handleConfirmLanguage,
    handleSkipTest,
    simulateListening,
    handleComplete,
    testPhrases,
  } = model;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {step === 0 && (
        <div className="w-full max-w-md bg-card rounded-2xl p-8 text-center space-y-6">
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => navigate(new ToHomeRoute())}>
              Fechar
            </Button>
          </div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Volume2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Teste de reconhecimento de voz</h2>
          <p className="text-muted-foreground">
            O reconhecimento de voz usado no app é nativo e depende da compatibilidade do seu dispositivo.
          </p>
          <p className="text-muted-foreground">
            Vamos fazer um teste rápido para verificar se tudo está funcionando.
          </p>
          <Button onClick={handleStartTest} className="w-full">
            <Mic className="h-4 w-4 mr-2" />
            Iniciar teste
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="w-full max-w-md bg-card rounded-2xl p-8 text-center space-y-6">
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => navigate(new ToHomeRoute())}>
              Fechar
            </Button>
          </div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Confirme o idioma</h2>
          <p className="text-muted-foreground">
            Confirme que o idioma do app está correto e que o idioma falado é o mesmo configurado no seu dispositivo.
          </p>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Português - Portuguese PT-BR</p>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português - Portuguese</SelectItem>
                <SelectItem value="en-US">English - United States</SelectItem>
                <SelectItem value="es-ES">Español - Spain</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(new ToHomeRoute())} className="flex-1">
              Pular
            </Button>
            <Button onClick={handleConfirmLanguage} className="flex-1">
              Confirmar idioma
            </Button>
          </div>
        </div>
      )}

      {(step === 2 || step === 3) && (
        <div className="w-full max-w-md bg-card rounded-2xl p-8 space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={handleSkipTest}>
              Pular
            </Button>
            <Button variant="ghost" onClick={() => navigate(new ToHomeRoute())}>
              Fechar
            </Button>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Repita a frase</h2>
            <p className="text-muted-foreground">
              Fale a frase exibida abaixo para testarmos o reconhecimento de voz.
            </p>
            <p className="text-sm font-medium">{currentPhraseIndex + 1} de 2</p>
          </div>

          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <p className="text-xs uppercase text-muted-foreground">Frase Esperada</p>
              <p className="text-sm">{testPhrases[currentPhraseIndex]}</p>
            </div>

            <div className="bg-secondary/30 rounded-lg p-4 space-y-2 min-h-[80px]">
              <p className="text-xs uppercase text-muted-foreground">Transcrição</p>
              <p className="text-sm">{transcription || "—"}</p>
            </div>

            {isListening && (
              <div className="text-center space-y-2">
                <p className="text-xs uppercase text-muted-foreground">Pontuação</p>
                <p className="text-2xl font-semibold">{score}%</p>
                <p className="text-yellow-500">Aguardando sua fala...</p>
              </div>
            )}

            {!isListening && transcription && (
              <div className="text-center space-y-2">
                <p className="text-xs uppercase text-muted-foreground">Pontuação</p>
                <p className="text-2xl font-semibold text-green-500">{score}%</p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              size="icon"
              className={`h-16 w-16 rounded-full ${isListening ? 'bg-destructive' : 'bg-primary'}`}
              onClick={simulateListening}
              disabled={isListening}
            >
              {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="w-full max-w-md bg-card rounded-2xl p-8 text-center space-y-6">
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => navigate(new ToHomeRoute())}>
              Fechar
            </Button>
          </div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Tudo certo!</h2>
          <p className="text-muted-foreground">
            Seu dispositivo é compatível com o reconhecimento de voz.
          </p>
          <Button onClick={handleComplete} className="w-full">
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
}

// Navigation Routes
export class AudioOnboardingRoute {}

export class ToHomeRoute extends AudioOnboardingRoute {}

export interface AudioOnboardingViewModel {
  navigate: (route: AudioOnboardingRoute) => void;
  step: number;
  selectedLanguage: string;
  setSelectedLanguage: (value: string) => void;
  currentPhraseIndex: number;
  isListening: boolean;
  transcription: string;
  score: number;
  handleStartTest: () => void;
  handleConfirmLanguage: () => void;
  handleSkipTest: () => void;
  simulateListening: () => void;
  handleComplete: () => void;
  testPhrases: string[];
}
