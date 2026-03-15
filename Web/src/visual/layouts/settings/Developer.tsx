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

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(new ToMoreRoute())}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Developer Options / Beta</h1>
              <p className="text-sm text-muted-foreground">
                Utilitários recuperados do settings legado.
              </p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Ferramentas</CardTitle>
              <CardDescription>Atalhos para telas técnicas e recursos beta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-14" onClick={openAiCalls}>
                <Bot className="h-4 w-4 mr-3" />
                AI Calls
              </Button>
              <Button variant="outline" className="w-full justify-start h-14" onClick={openSubscriptions}>
                <Sparkles className="h-4 w-4 mr-3" />
                Subscrições
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Onboarding</CardTitle>
              <CardDescription>Reabre fluxos de onboarding para novo teste.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-14" onClick={resetAssistantOnboarding}>
                <Bot className="h-4 w-4 mr-3" />
                Resetar onboarding do assistente
              </Button>
              <Button variant="outline" className="w-full justify-start h-14" onClick={resetMicrophoneOnboarding}>
                <Mic className="h-4 w-4 mr-3" />
                Resetar onboarding do microfone
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Criptografia</CardTitle>
              <CardDescription>
                Alterna `disableEncryption` e regrava os repositórios criptografados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Desativar criptografia</p>
                  <p className="text-xs text-muted-foreground">
                    Uso somente técnico. A alteração resalva os dados compatíveis.
                  </p>
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
                        <span>Itens regravados</span>
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
              <CardTitle>Kill Account Registers</CardTitle>
              <CardDescription>
                Remove definitivamente todos os registros de uma conta pelo ID.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={killAccountId}
                  onChange={(event) => setKillAccountId(event.target.value)}
                  placeholder="ID da conta"
                />
                <Button variant="destructive" onClick={killAccountRegisters} className="sm:w-auto">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Executar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use apenas quando souber exatamente qual conta precisa ser limpa.
              </p>
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
