import { Slider } from "@components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { Label } from "@components/ui/label";
import { Check, ChevronRight, Mic, Zap, Languages, ArrowLeft, Palette } from "lucide-react";
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
  const LocalLang = Lang.visual.settings;
  const densityOptions = [
    { id: 1, name: LocalLang.density.compact, description: "87.5%" },
    { id: 2, name: LocalLang.density.normal, description: "100%" },
    { id: 3, name: LocalLang.density.comfortable, description: "112.5%" },
    { id: 4, name: LocalLang.density.spacious, description: "125%" },
  ];

  return (
    <div className="min-h-full bg-background">
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
              <h1 className="text-2xl font-bold text-foreground">{LocalLang.title}</h1>
              <p className="text-sm text-muted-foreground">{LocalLang.subtitle}</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          {/* Aparência */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {LocalLang.appearance}
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
                        <p className="text-sm font-medium text-foreground">{LocalLang.themeAndColors}</p>
                        <p className="text-xs text-muted-foreground">{LocalLang.customizeAppearance}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <ThemeCustomizer applyImmediately={true} showDensity={false} />
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
                    <p className="text-sm font-medium text-foreground">{LocalLang.languageTitle}</p>
                    <p className="text-xs text-muted-foreground">{model.currentLanguageLabel}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-4 space-y-4 border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground">{LocalLang.densityTitle}</p>
                <p className="text-xs text-muted-foreground">{LocalLang.densityDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {densityOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`cursor-pointer p-4 transition-all hover:border-primary ${
                      model.density === option.id ? "border-primary bg-primary/5" : "border-border/50"
                    }`}
                    onClick={() => model.setDensity(option.id)}
                  >
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{option.name}</span>
                        {model.density === option.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>

          {/* Configurações do Assistente de IA */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {LocalLang.aiAssistant}
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
                        <p className="text-sm font-medium text-foreground">{LocalLang.voiceAndAudio}</p>
                        <p className="text-xs text-muted-foreground">{LocalLang.speechSettings}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <VoiceSettingsContent model={model.voiceSettings} showEnableToggle={true} />
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
                        <p className="text-sm font-medium text-foreground">{LocalLang.behavior}</p>
                        <p className="text-xs text-muted-foreground">{LocalLang.interactionMode}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <AssistantModeContent model={model.assistantBehavior} variant="radio" />
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Timeline/Comportamento do App */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {LocalLang.timelineBehavior}
            </h3>
            <Card className="p-4 space-y-4 border-border/50">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">{LocalLang.financialMonthStartDay}</Label>
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
                <Label className="text-sm font-medium text-foreground">{LocalLang.financialMonthName}</Label>
                <RadioGroup value={monthNameMode} onValueChange={setMonthNameMode} className="space-y-3">
                  <Card className="p-3 border-border/50">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="start" id="start" className="mt-1" />
                      <Label htmlFor="start" className="text-sm cursor-pointer flex-1">
                        <div className="font-medium text-foreground mb-1">{LocalLang.currentMonthMode}</div>
                        <div className="text-xs text-muted-foreground">
                          {LocalLang.currentMonthDescription}
                        </div>
                      </Label>
                    </div>
                  </Card>
                  <Card className="p-3 border-border/50">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="next" id="next" className="mt-1" />
                      <Label htmlFor="next" className="text-sm cursor-pointer flex-1">
                        <div className="font-medium text-foreground mb-1">{LocalLang.nextMonthMode}</div>
                        <div className="text-xs text-muted-foreground">
                          {LocalLang.nextMonthDescription}
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
  currentLanguageLabel: string;
  density: number;
  setDensity: (value: number) => void;
  syncLanguage: (value: string) => void;
  voiceSettings: import("@components/VoiceSettingsContent").VoiceSettingsContentViewModel;
  assistantBehavior: import("@components/AssistantModeContent").AssistantModeContentViewModel;
}
