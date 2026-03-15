import { ArrowLeft, Bot, Mic, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Progress } from "@components/ui/progress";
import { Switch } from "@components/ui/switch";
import type { DataProgressInfo } from "@components/DataProgress";

interface DeveloperProps {
  model: DeveloperViewModel;
}

export default function Developer({ model }: DeveloperProps) {
  const {
    navigate,
    encryptionDisabled,
    killAccountId,
    setKillAccountId,
    resaveProgress,
    openAiCalls,
    openSubscriptions,
    resetAssistantOnboarding,
    resetMicrophoneOnboarding,
    toggleEncryption,
    killAccountRegisters,
  } = model;
  const LocalLang = Lang.visual.settings.developer;

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(new ToMoreRoute())}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{LocalLang.title}</h1>
              <p className="text-sm text-muted-foreground">{LocalLang.subtitle}</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>{LocalLang.toolsTitle}</CardTitle>
              <CardDescription>{LocalLang.toolsDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-14" onClick={openAiCalls}>
                <Bot className="h-4 w-4 mr-3" />
                {LocalLang.aiCalls}
              </Button>
              <Button variant="outline" className="w-full justify-start h-14" onClick={openSubscriptions}>
                <Sparkles className="h-4 w-4 mr-3" />
                {LocalLang.subscriptions}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>{LocalLang.onboardingTitle}</CardTitle>
              <CardDescription>{LocalLang.onboardingDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-14" onClick={resetAssistantOnboarding}>
                <Bot className="h-4 w-4 mr-3" />
                {LocalLang.resetAssistant}
              </Button>
              <Button variant="outline" className="w-full justify-start h-14" onClick={resetMicrophoneOnboarding}>
                <Mic className="h-4 w-4 mr-3" />
                {LocalLang.resetMicrophone}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>{LocalLang.encryptionTitle}</CardTitle>
              <CardDescription>{LocalLang.encryptionDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{LocalLang.disableEncryption}</p>
                  <p className="text-xs text-muted-foreground">{LocalLang.disableEncryptionDescription}</p>
                </div>
                <Switch checked={encryptionDisabled} onCheckedChange={() => void toggleEncryption()} />
              </div>

              {resaveProgress && (
                <div className="space-y-3 rounded-lg border border-border/50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{resaveProgress.domain}</span>
                    <span className="text-muted-foreground">
                      {resaveProgress.current}/{resaveProgress.max}
                    </span>
                  </div>
                  <Progress value={(resaveProgress.current / resaveProgress.max) * 100} className="h-2" />
                  {resaveProgress.sub && (
                    <>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{LocalLang.rewrittenItems}</span>
                        <span>{resaveProgress.sub.current}/{resaveProgress.sub.max}</span>
                      </div>
                      <Progress
                        value={resaveProgress.sub.max ? (resaveProgress.sub.current / resaveProgress.sub.max) * 100 : 0}
                        className="h-2"
                      />
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle>{LocalLang.killAccountTitle}</CardTitle>
              <CardDescription>{LocalLang.killAccountDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={killAccountId}
                  onChange={(event) => setKillAccountId(event.target.value)}
                  placeholder={LocalLang.accountIdPlaceholder}
                />
                <Button variant="destructive" onClick={killAccountRegisters} className="sm:w-auto">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {LocalLang.runAction}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{LocalLang.killAccountHint}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export class DeveloperRoute {}
export class ToMoreRoute extends DeveloperRoute {}

export interface DeveloperViewModel {
  navigate: (route: DeveloperRoute) => void;
  encryptionDisabled: boolean;
  killAccountId: string;
  setKillAccountId: (value: string) => void;
  resaveProgress: DataProgressInfo | null;
  openAiCalls: () => void;
  openSubscriptions: () => void;
  resetAssistantOnboarding: () => Promise<void>;
  resetMicrophoneOnboarding: () => void;
  toggleEncryption: () => Promise<void>;
  killAccountRegisters: () => Promise<void>;
}
