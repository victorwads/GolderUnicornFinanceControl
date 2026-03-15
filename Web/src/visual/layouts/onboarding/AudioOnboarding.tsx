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
    languageOptions,
    currentLanguageSummary,
    currentPhraseIndex,
    isListening,
    transcription,
    score,
    progressLabel,
    status,
    handleStartTest,
    handleConfirmLanguage,
    handleSkipTest,
    simulateListening,
    handleComplete,
    handleTryAgain,
    testPhrases,
  } = model;
  const LocalLang = Lang.aiMic.onboarding;
  const statusTone =
    status === "success"
      ? "text-emerald-600"
      : status === "retry"
        ? "text-destructive"
        : "text-yellow-500";

  return (
    <div className="w-full flex items-center justify-center">
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
            <p className="text-sm text-muted-foreground">{currentLanguageSummary}</p>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <SelectValue placeholder={languageOptions[0]?.label} />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((language) => (
                  <SelectItem key={language.value || "default"} value={language.value}>
                    {language.label}
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
            <p className="text-sm font-medium">{progressLabel}</p>
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

            <div className="text-center space-y-2">
              <p className="text-xs uppercase text-muted-foreground">{LocalLang.verification.scoreLabel}</p>
              <p className="text-2xl font-semibold">{transcription ? `${score}%` : "—"}</p>
              <p className={statusTone}>{LocalLang.verification[status]}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              size="icon"
              className={`h-16 w-16 rounded-full ${isListening ? 'bg-destructive' : 'bg-primary'}`}
              onClick={simulateListening}
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
            {LocalLang.actions.imDone}
          </Button>
        </div>
      )}

      {step === 5 && (
        <div className="w-full max-w-md bg-card rounded-2xl p-8 text-center space-y-6">
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => navigate(new ToHomeRoute())}>
              {LocalLang.actions.close}
            </Button>
          </div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <MicOff className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold">{LocalLang.fail.title}</h2>
          <p className="text-muted-foreground">
            {LocalLang.fail.p1}
          </p>
          <Button onClick={handleTryAgain} className="w-full">
            {LocalLang.actions.tryAgain}
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
  languageOptions: Array<{ value: string; label: string }>;
  currentLanguageSummary: string;
  currentPhraseIndex: number;
  isListening: boolean;
  transcription: string;
  score: number;
  progressLabel: string;
  status: "waiting" | "success" | "retry";
  handleStartTest: () => void;
  handleConfirmLanguage: () => void;
  handleSkipTest: () => void;
  simulateListening: () => void;
  handleComplete: () => void;
  handleTryAgain: () => void;
  testPhrases: string[];
}
