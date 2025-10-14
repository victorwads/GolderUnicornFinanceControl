import './Vars.css'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import getBroadcastChannel from '@utils/Broadcast';
import { ProjectStorage } from '@utils/ProjectStorage';

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

const readNavigatorOnline = () => {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }

  return true;
};

const dispatchConnectionEvent = (isOnline: boolean) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent('app:connection-change', { detail: { isOnline } }));
    return;
  }

  const fallbackEvent = new Event('app:connection-change');
  Object.assign(fallbackEvent, { detail: { isOnline } });
  window.dispatchEvent(fallbackEvent);
};

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
  isOnline: boolean;
}

const VarsContext = createContext<VarsContextProps | undefined>(undefined);
const DEFAULT_DENSITY: Density = window.innerWidth < 400 ? 'density-1' : 'density-2';
const DENSITY_KEY = 'densityV2';
const THEME_KEY = 'theme';

export const VarsChannel = getBroadcastChannel<'change', Partial<ThemeSettings>>('theme-config');

export function VarsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => ProjectStorage.get(THEME_KEY) as Theme || 'theme-dark');
  const [density, setDensityState] = useState<Density>(() => ProjectStorage.get(DENSITY_KEY) as Density || DEFAULT_DENSITY);
  const [lang, setLang] = useState<string>(CurrentLang);
  const [isOnline, setIsOnline] = useState<boolean>(() => readNavigatorOnline());

  useEffect(() => {
    ProjectStorage.set(THEME_KEY, theme);
    ProjectStorage.set(DENSITY_KEY, density);
  }, [theme, density]);

  useEffect(() => {
    VarsChannel.publish('change')
    return VarsChannel.subscribe((type, payload) => {
      if (payload.theme) setThemeState(payload.theme);
      if (payload.density) setDensityState(payload.density);
    })
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateNetworkState = () => {
      const online = readNavigatorOnline();
      setIsOnline(online);
      dispatchConnectionEvent(online);
    };

    updateNetworkState();

    window.addEventListener('online', updateNetworkState);
    window.addEventListener('offline', updateNetworkState);

    return () => {
      window.removeEventListener('online', updateNetworkState);
      window.removeEventListener('offline', updateNetworkState);
    };
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
    <VarsContext.Provider key={lang} value={{ theme, density, setTheme, setDensity, lang, isOnline }}>
      {children}
    </VarsContext.Provider>
  );
}

export function useCssVars() {
  const context = useContext(VarsContext);
  if (!context) throw new Error('useTheme must be used within a VarsProvider');
  return context;
}

export function useNetworkState() {
  const context = useContext(VarsContext);
  if (!context) throw new Error('useNetworkState must be used within a VarsProvider');

  return { isOnline: context.isOnline, isOffline: !context.isOnline };
}
