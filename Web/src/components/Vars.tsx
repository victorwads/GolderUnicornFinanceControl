import './Vars.css'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import getBroadcastChannel from '@utils/Broadcast';
import { setLanguage } from '@lang';

declare global {
  interface Window {
    ThemeSettings?: {
      theme: Theme;
      density: Density;
      setDark: (dark: boolean) => void;
      setLang: (lang: string) => void;
    };
  }
}

export type Theme = 'theme-light' | 'theme-dark';
export type Density = 'density-1' | 'density-2' | 'density-3' | 'density-4';

interface ThemeSettings {
  theme: Theme;
  density: Density;
  lang: string;
}

interface VarsContextProps extends ThemeSettings {
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
}

const VarsContext = createContext<VarsContextProps | undefined>(undefined);

export const VarsChannel = getBroadcastChannel<'change', Partial<ThemeSettings>>('theme-config');

export function VarsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => localStorage.getItem('theme') as Theme || 'theme-dark');
  const [density, setDensityState] = useState<Density>(() => localStorage.getItem('density') as Density || 'density-2');
  const [lang, setLang] = useState<string>(CurrentLang);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('density', density);
  }, [theme, density]);

  useEffect(() => {
    VarsChannel.publish('change')
    return VarsChannel.subscribe((type, payload) => {
      if (payload.theme) setThemeState(payload.theme);
      if (payload.density) setDensityState(payload.density);
    })
  }, []);

  const setTheme = (theme: Theme) => {
    setThemeState(theme);
    VarsChannel.publish('change', { theme }, true);
  };
  const setDensity = (newDensity: Density) => {
    setDensityState(newDensity);
    VarsChannel.publish('change', { density: newDensity }, true);
  };

  window.ThemeSettings = { 
    theme, density, 
    setDark: (dark: boolean) => setTheme(dark ? 'theme-dark' : 'theme-light'),
    setLang
  };

  return (
    <VarsContext.Provider key={lang} value={{ theme, density, setTheme, setDensity, lang }}>
      {children}
    </VarsContext.Provider>
  );
}

export function useCssVars() {
  const context = useContext(VarsContext);
  if (!context) throw new Error('useTheme must be used within a VarsProvider');
  return context;
}
