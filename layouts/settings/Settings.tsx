import { Slider } from "@components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { Label } from "@components/ui/label";
import { ChevronRight, Mic, Zap, Languages, ArrowLeft, Palette } from "lucide-react";
import { MicButton } from "@components/MicButton";
import { TabBar } from "@components/TabBar";
import { Card } from "@components/ui/card";
import { Button } from "@components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";
import ThemeCustomizer from "@components/ThemeCustomizer";
import VoiceSettingsContent from "@components/VoiceSettingsContent";
import AssistantModeContent from "@components/AssistantModeContent";

interface SettingsProps {
  model: SettingsViewModel;
}

export default function Settings({ model }: SettingsProps) {
  const { navigate, monthStartDay, setMonthStartDay, monthNameMode, setMonthNameMode } = model;

  return (
    <div className="min-h-screen bg-background pb-36">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(new ToMoreRoute())}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
              <p className="text-sm text-muted-foreground">Preferências do aplicativo</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          {/* Aparência */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Aparência
            </h3>
            <Accordion type="multiple" className="space-y-3">
              <AccordionItem value="theme" className="border-0">
                <Card className="overflow-hidden border-border/50">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Palette className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Tema e Cores</p>
                        <p className="text-xs text-muted-foreground">Personalizar aparência</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <ThemeCustomizer applyImmediately={true} />
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>

            <Card 
              className="overflow-hidden border-border/50 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(new ToLanguageRoute())}
            >
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Languages className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Idioma</p>
                    <p className="text-xs text-muted-foreground">Escolher idioma do app</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </div>

          {/* Configurações do Assistente de IA */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Configurações do Assistente de IA
            </h3>
            <Accordion type="multiple" className="space-y-3">
              <AccordionItem value="voice" className="border-0">
                <Card className="overflow-hidden border-border/50">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mic className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Voz e Áudio</p>
                        <p className="text-xs text-muted-foreground">Configurações de fala</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <VoiceSettingsContent showEnableToggle={true} />
                  </AccordionContent>
                </Card>
              </AccordionItem>

              <AccordionItem value="behavior" className="border-0">
                <Card className="overflow-hidden border-border/50">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Comportamento</p>
                        <p className="text-xs text-muted-foreground">Modo de interação</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <AssistantModeContent variant="radio" />
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Timeline/Comportamento do App */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Timeline / Comportamento do App
            </h3>
            <Card className="p-4 space-y-4 border-border/50">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Dia de início do seu mês financeiro</Label>
                <div className="flex items-center gap-4">
                  <Slider 
                    value={monthStartDay} 
                    onValueChange={setMonthStartDay}
                    min={1} 
                    max={28} 
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-foreground w-8 text-right">{monthStartDay[0]}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-sm font-medium text-foreground">Nome do mês financeiro</Label>
                <RadioGroup value={monthNameMode} onValueChange={setMonthNameMode} className="space-y-3">
                  <Card className="p-3 border-border/50">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="current" id="current" className="mt-1" />
                      <Label htmlFor="current" className="text-sm cursor-pointer flex-1">
                        <div className="font-medium text-foreground mb-1">Mês atual ao dia escolhido</div>
                        <div className="text-xs text-muted-foreground">
                          Dia 15/10 em diante será chamado de Outubro. Antes de 15/10 será chamado Setembro.
                        </div>
                      </Label>
                    </div>
                  </Card>
                  <Card className="p-3 border-border/50">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="next" id="next" className="mt-1" />
                      <Label htmlFor="next" className="text-sm cursor-pointer flex-1">
                        <div className="font-medium text-foreground mb-1">Próximo mês após o dia escolhido</div>
                        <div className="text-xs text-muted-foreground">
                          Dia 15/10 em diante será chamado de Novembro. Antes de 15/10 será chamado Outubro.
                        </div>
                      </Label>
                    </div>
                  </Card>
                </RadioGroup>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <MicButton />
      <TabBar />
    </div>
  );
}

// Navigation Routes
export class SettingsRoute {}

export class ToMoreRoute extends SettingsRoute {}
export class ToLanguageRoute extends SettingsRoute {}

export interface SettingsViewModel {
  navigate: (route: SettingsRoute) => void;
  monthStartDay: number[];
  setMonthStartDay: (value: number[]) => void;
  monthNameMode: string;
  setMonthNameMode: (value: string) => void;
}
