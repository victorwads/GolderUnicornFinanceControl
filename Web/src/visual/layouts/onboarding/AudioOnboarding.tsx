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
  const LocalLang = Lang.aiMic.onboarding;
  const availableLanguages = Object.values(window.Langs || {});

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {step === 0 && (
        <div className="w-full max-w-md bg-card rounded-2xl p-8 text-center space-y-6">
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => navigate(new ToHomeRoute())}>
              {LocalLang.actions.close}
            </Button>
          </div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Volume2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">{LocalLang.info.title}</h2>
          <p className="text-muted-foreground">
            {LocalLang.info.p1}
          </p>
          <p className="text-muted-foreground">
            {LocalLang.info.p2}
          </p>
          <Button onClick={handleStartTest} className="w-full">
            <Mic className="h-4 w-4 mr-2" />
            {LocalLang.actions.start}
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="w-full max-w-md bg-card rounded-2xl p-8 text-center space-y-6">
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => navigate(new ToHomeRoute())}>
              {LocalLang.actions.close}
            </Button>
          </div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">{LocalLang.lang.title}</h2>
          <p className="text-muted-foreground">
            {LocalLang.lang.p1}
          </p>
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{CurrentLangInfo.name} {CurrentLangInfo.short}</p>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((language) => (
                  <SelectItem key={language.short} value={language.short}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(new ToHomeRoute())} className="flex-1">
              {LocalLang.actions.imDone}
            </Button>
            <Button onClick={handleConfirmLanguage} className="flex-1">
              {LocalLang.actions.confirm}
            </Button>
          </div>
        </div>
      )}

      {(step === 2 || step === 3) && (
        <div className="w-full max-w-md bg-card rounded-2xl p-8 space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={handleSkipTest}>
              {LocalLang.actions.imDone}
            </Button>
            <Button variant="ghost" onClick={() => navigate(new ToHomeRoute())}>
              {LocalLang.actions.close}
            </Button>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">{LocalLang.verification.title}</h2>
            <p className="text-muted-foreground">
              {LocalLang.verification.instructions}
            </p>
            <p className="text-sm font-medium">{LocalLang.progress(currentPhraseIndex + 1, testPhrases.length)}</p>
          </div>

          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <p className="text-xs uppercase text-muted-foreground">{LocalLang.verification.targetLabel}</p>
              <p className="text-sm">{testPhrases[currentPhraseIndex]}</p>
            </div>

            <div className="bg-secondary/30 rounded-lg p-4 space-y-2 min-h-[80px]">
              <p className="text-xs uppercase text-muted-foreground">{LocalLang.verification.transcriptLabel}</p>
              <p className="text-sm">{transcription || "—"}</p>
            </div>

            {isListening && (
              <div className="text-center space-y-2">
                <p className="text-xs uppercase text-muted-foreground">{LocalLang.verification.scoreLabel}</p>
                <p className="text-2xl font-semibold">{score}%</p>
                <p className="text-yellow-500">{LocalLang.verification.waiting}</p>
              </div>
            )}

            {!isListening && transcription && (
              <div className="text-center space-y-2">
                <p className="text-xs uppercase text-muted-foreground">{LocalLang.verification.scoreLabel}</p>
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
              {LocalLang.actions.close}
            </Button>
          </div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">{LocalLang.success.title}</h2>
          <p className="text-muted-foreground">
            {LocalLang.success.p1}
          </p>
          <Button onClick={handleComplete} className="w-full">
            {Lang.visual.onboarding.audio.confirmLanguage}
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
