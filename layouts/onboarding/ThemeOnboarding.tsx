import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { Check, Sun, Moon, Monitor } from "lucide-react";

const themeOptions = [
  { id: "light", name: "Claro", icon: Sun, description: "Tema claro para uso diurno" },
  { id: "dark", name: "Escuro", icon: Moon, description: "Tema escuro para reduzir o cansaço visual" },
  { id: "system", name: "Sistema", icon: Monitor, description: "Segue a configuração do seu dispositivo" }
];

const colorOptions = [
  { id: "purple", color: "hsl(262, 83%, 58%)", name: "Roxo" },
  { id: "blue", color: "hsl(217, 91%, 60%)", name: "Azul" },
  { id: "green", color: "hsl(142, 76%, 36%)", name: "Verde" },
  { id: "orange", color: "hsl(24, 95%, 53%)", name: "Laranja" },
  { id: "pink", color: "hsl(330, 81%, 60%)", name: "Rosa" },
  { id: "red", color: "hsl(0, 72%, 51%)", name: "Vermelho" },
];

const densityOptions = [
  { id: 1, name: "Compacto", description: "87.5%" },
  { id: 2, name: "Normal", description: "100%" },
  { id: 3, name: "Confortável", description: "112.5%" },
  { id: 4, name: "Espaçoso", description: "125%" },
];

interface ThemeOnboardingProps {
  model: ThemeOnboardingViewModel;
}

export default function ThemeOnboarding({ model }: ThemeOnboardingProps) {
  const { selectedTheme, setSelectedTheme, selectedColor, setSelectedColor, selectedDensity, setSelectedDensity, handleContinue } = model;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card rounded-2xl p-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Personalize sua experiência</h2>
          <p className="text-muted-foreground">
            Escolha o tema e a cor principal do aplicativo
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Tema</h3>
          <div className="grid grid-cols-3 gap-4">
            {themeOptions.map((theme) => {
              const Icon = theme.icon;
              return (
                <Card
                  key={theme.id}
                  className={`p-6 cursor-pointer transition-all hover:border-primary ${
                    selectedTheme === theme.id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className={`p-3 rounded-lg ${
                      theme.id === "light" ? "bg-white border border-border" :
                      theme.id === "dark" ? "bg-gray-900 text-white" :
                      "bg-gradient-to-br from-white to-gray-900 text-foreground"
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-medium">{theme.name}</span>
                        {selectedTheme === theme.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{theme.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Cor principal</h3>
          <div className="grid grid-cols-6 gap-3">
            {colorOptions.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.id as "purple" | "blue" | "green" | "orange" | "pink" | "red")}
                className={`relative h-12 rounded-lg transition-all hover:scale-110 ${
                  selectedColor === color.id ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                }`}
                style={{ backgroundColor: color.color }}
                title={color.name}
              >
                {selectedColor === color.id && (
                  <Check className="h-5 w-5 text-white absolute inset-0 m-auto drop-shadow-lg" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Densidade</h3>
          <div className="grid grid-cols-4 gap-3">
            {densityOptions.map((densityOption) => (
              <Card
                key={densityOption.id}
                className={`p-4 cursor-pointer transition-all hover:border-primary ${
                  selectedDensity === densityOption.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setSelectedDensity(densityOption.id)}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-medium text-sm">{densityOption.name}</span>
                    {selectedDensity === densityOption.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{densityOption.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={handleContinue} className="w-full">
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface ThemeOnboardingViewModel {
  navigate: (path: string) => void;
  selectedTheme: string;
  setSelectedTheme: (value: string) => void;
  selectedColor: "purple" | "blue" | "green" | "orange" | "pink" | "red";
  setSelectedColor: (value: "purple" | "blue" | "green" | "orange" | "pink" | "red") => void;
  selectedDensity: number;
  setSelectedDensity: (value: number) => void;
  handleContinue: () => void;
}
