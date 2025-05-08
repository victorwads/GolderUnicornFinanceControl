import './Vars.css'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'theme-light' | 'theme-dark';
export type Density = 'density-1' | 'density-2' | 'density-3' | 'density-4';

interface VarsContextProps {
  theme: Theme;
  density: Density;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
}

const VarsContext = createContext<VarsContextProps | undefined>(undefined);

export function VarsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => localStorage.getItem('theme') as Theme || 'theme-light');
  const [density, setDensityState] = useState<Density>(() => localStorage.getItem('density') as Density || 'density-2');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('density', density);
  }, [theme, density]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const setDensity = (newDensity: Density) => setDensityState(newDensity);

  return (
    <VarsContext.Provider value={{ theme, density, setTheme, setDensity }}>
      {children}
    </VarsContext.Provider>
  );
}

export function useCssVars() {
  const context = useContext(VarsContext);
  if (!context) throw new Error('useTheme must be used within a VarsProvider');
  return context;
}