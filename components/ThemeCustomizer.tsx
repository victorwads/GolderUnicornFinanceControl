import { useEffect } from "react";
import { Card } from "@components/ui/card";
import { Check, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useThemeColor } from "@contexts/ThemeColorContext";
import { useDensity } from "@contexts/DensityContext";

const themeOptions = [
  {
    id: "light",
    name: "Claro",
    icon: Sun,
    description: "Tema claro para uso diurno"
  },
  {
    id: "dark",
    name: "Escuro",
    icon: Moon,
    description: "Tema escuro para reduzir o cansaço visual"
  },
  {
    id: "system",
    name: "Sistema",
    icon: Monitor,
    description: "Segue a configuração do seu dispositivo"
  }
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

interface ThemeCustomizerProps {
  applyImmediately?: boolean;
}

export default function ThemeCustomizer({ applyImmediately = true }: ThemeCustomizerProps) {
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useThemeColor();
  const { density, setDensity } = useDensity();

  const handleThemeChange = (newTheme: string) => {
    if (applyImmediately) {
      setTheme(newTheme);
    }
  };

  const handleColorChange = (newColor: "purple" | "blue" | "green" | "orange" | "pink" | "red") => {
    if (applyImmediately) {
      setColorTheme(newColor);
    }
  };

  const handleDensityChange = (newDensity: number) => {
    if (applyImmediately) {
      setDensity(newDensity);
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="space-y-4">
        <h3 className="font-medium">Tema</h3>
        <div className="grid grid-cols-3 gap-4">
          {themeOptions.map((themeOption) => {
            const Icon = themeOption.icon;
            return (
              <Card
                key={themeOption.id}
                className={`p-6 cursor-pointer transition-all hover:border-primary ${
                  theme === themeOption.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => handleThemeChange(themeOption.id)}
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className={`p-3 rounded-lg ${
                    themeOption.id === "light" ? "bg-white border border-border" :
                    themeOption.id === "dark" ? "bg-gray-900 text-white" :
                    "bg-gradient-to-br from-white to-gray-900 text-foreground"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium">{themeOption.name}</span>
                      {theme === themeOption.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{themeOption.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-4">
        <h3 className="font-medium">Cor principal</h3>
        <div className="grid grid-cols-6 gap-3">
          {colorOptions.map((color) => (
            <button
              key={color.id}
              onClick={() => handleColorChange(color.id as "purple" | "blue" | "green" | "orange" | "pink" | "red")}
              className={`relative h-12 rounded-lg transition-all hover:scale-110 ${
                colorTheme === color.id ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
              }`}
              style={{ backgroundColor: color.color }}
              title={color.name}
            >
              {colorTheme === color.id && (
                <Check className="h-5 w-5 text-white absolute inset-0 m-auto drop-shadow-lg" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Density Selection */}
      <div className="space-y-4">
        <h3 className="font-medium">Densidade</h3>
        <div className="grid grid-cols-4 gap-3">
          {densityOptions.map((densityOption) => (
            <Card
              key={densityOption.id}
              className={`p-4 cursor-pointer transition-all hover:border-primary ${
                density === densityOption.id ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => handleDensityChange(densityOption.id)}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium text-sm">{densityOption.name}</span>
                  {density === densityOption.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{densityOption.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
