import React, { createContext, useContext, useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";

type ColorTheme = "purple" | "blue" | "green" | "orange" | "pink" | "red";

interface ThemeColorContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

const colorThemes: Record<ColorTheme, { primary: string; accent: string; ring: string; gradientPrimary: string }> = {
  purple: {
    primary: "262 83% 58%",
    accent: "262 83% 58%",
    ring: "262 83% 58%",
    gradientPrimary: "linear-gradient(135deg, hsl(262 83% 58%), hsl(282 83% 58%))"
  },
  blue: {
    primary: "217 91% 60%",
    accent: "217 91% 60%",
    ring: "217 91% 60%",
    gradientPrimary: "linear-gradient(135deg, hsl(217 91% 60%), hsl(237 91% 60%))"
  },
  green: {
    primary: "142 76% 36%",
    accent: "142 76% 36%",
    ring: "142 76% 36%",
    gradientPrimary: "linear-gradient(135deg, hsl(142 76% 36%), hsl(162 76% 36%))"
  },
  orange: {
    primary: "24 95% 53%",
    accent: "24 95% 53%",
    ring: "24 95% 53%",
    gradientPrimary: "linear-gradient(135deg, hsl(24 95% 53%), hsl(44 95% 53%))"
  },
  pink: {
    primary: "330 81% 60%",
    accent: "330 81% 60%",
    ring: "330 81% 60%",
    gradientPrimary: "linear-gradient(135deg, hsl(330 81% 60%), hsl(350 81% 60%))"
  },
  red: {
    primary: "0 72% 51%",
    accent: "0 72% 51%",
    ring: "0 72% 51%",
    gradientPrimary: "linear-gradient(135deg, hsl(0 72% 51%), hsl(20 72% 51%))"
  }
};

export const ThemeColorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorTheme, setColorTheme] = useLocalStorageState<ColorTheme>("color-theme", {
    defaultValue: "purple"
  });

  useEffect(() => {
    const root = document.documentElement;
    const theme = colorThemes[colorTheme];
    
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--ring", theme.ring);
    root.style.setProperty("--gradient-primary", theme.gradientPrimary);
  }, [colorTheme]);

  return (
    <ThemeColorContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ThemeColorContext.Provider>
  );
};

export const useThemeColor = () => {
  const context = useContext(ThemeColorContext);
  if (context === undefined) {
    throw new Error("useThemeColor must be used within a ThemeColorProvider");
  }
  return context;
};
