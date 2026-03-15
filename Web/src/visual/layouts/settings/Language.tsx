import { ArrowLeft, Check, Languages } from "lucide-react";

import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";

interface LanguageProps {
  model: LanguageViewModel;
}

export default function Language({ model }: LanguageProps) {
  const { navigate, selectedLanguage, currentLanguageLabel, languages, selectLanguage } = model;

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(new ToSettingsRoute())}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Idioma</h1>
              <p className="text-sm text-muted-foreground">{currentLanguageLabel}</p>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-6 animate-fade-in">
          <Card className="p-4 border-border/50">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Languages className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Escolha o idioma do app</p>
                <p className="text-sm text-muted-foreground">
                  A mudança é aplicada imediatamente em todo o aplicativo.
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            {languages.map((language) => {
              const isSelected = language.value === selectedLanguage;
              return (
                <Card
                  key={language.value || "default"}
                  className={`cursor-pointer border-border/50 p-4 transition-colors hover:bg-accent/50 ${
                    isSelected ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => selectLanguage(language.value)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{language.label}</p>
                      <p className="text-xs text-muted-foreground">{language.description}</p>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-primary shrink-0" />}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export class LanguageRoute {}
export class ToSettingsRoute extends LanguageRoute {}

export interface LanguageViewModel {
  selectedLanguage: string;
  currentLanguageLabel: string;
  languages: {
    value: string;
    label: string;
    description: string;
  }[];
  navigate: (route: LanguageRoute) => void;
  selectLanguage: (value: string) => void;
}
