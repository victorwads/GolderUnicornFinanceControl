import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export interface AppUpdatesContextValue {
  version: string;
  updateAvailable: boolean;
  offlineReady: boolean;
  checkingForUpdate: boolean;
  checkForUpdates: () => Promise<void>;
  applyUpdate: () => Promise<void>;
}

const AppUpdatesContext = createContext<AppUpdatesContextValue | undefined>(undefined);

const ONE_HOUR = 1000 * 60 * 60;

declare global {
  interface Window {
    AppUpdates?: AppUpdatesContextValue;
  }
}

export function AppUpdatesProvider({ children }: { children: ReactNode }) {
  const version = useMemo(() => {
    const rawVersion = __APP_VERSION__ || 'dev';
    return rawVersion;
  }, []);

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [checkingForUpdate, setCheckingForUpdate] = useState(false);

  const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const updateIntervalRef = useRef<number>();
  const detachRegistrationListenerRef = useRef<(() => void) | undefined>();

  const checkForUpdates = useCallback(async () => {
    if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    setCheckingForUpdate(true);
    try {
      if (registrationRef.current) {
        await registrationRef.current.update();
      } else if (updateSWRef.current) {
        await updateSWRef.current();
      }
    } catch (error) {
      console.error('Failed to check for updates', error);
    } finally {
      setCheckingForUpdate(false);
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    if (!import.meta.env.PROD || typeof window === 'undefined' || !updateSWRef.current) {
      window.location.reload();
      return;
    }

    try {
      await updateSWRef.current(true);
    } catch (error) {
      console.error('Failed to apply update', error);
      setUpdateAvailable(true);
    }
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let isCancelled = false;

    const controllerChangeHandler = () => {
      setUpdateAvailable(false);
    };

    const handleRegistration = (registration: ServiceWorkerRegistration | undefined) => {
      if (!registration || isCancelled) {
        return;
      }

      detachRegistrationListenerRef.current?.();
      registrationRef.current = registration;

      if (registration.waiting) {
        setUpdateAvailable(true);
      }

      const onUpdateFound = () => {
        const newWorker = registration.installing;
        if (!newWorker) {
          return;
        }

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      };

      registration.addEventListener('updatefound', onUpdateFound);
      if (registration.installing) {
        onUpdateFound();
      }

      detachRegistrationListenerRef.current = () => {
        registration.removeEventListener('updatefound', onUpdateFound);
      };

      if (updateIntervalRef.current) {
        window.clearInterval(updateIntervalRef.current);
      }
      updateIntervalRef.current = window.setInterval(() => {
        registration.update().catch(() => undefined);
      }, ONE_HOUR);
    };

    const updateSW = registerSW({
      immediate: true,
      onRegisteredSW(_url, registration) {
        handleRegistration(registration);
      },
      onNeedRefresh() {
        if (!isCancelled) {
          setUpdateAvailable(true);
        }
      },
      onOfflineReady() {
        if (!isCancelled) {
          setOfflineReady(true);
        }
      },
      onRegisterError(error) {
        console.error('Service worker registration failed', error);
      },
    });

    updateSWRef.current = updateSW;
    navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);

    return () => {
      isCancelled = true;
      updateSWRef.current = null;
      registrationRef.current = null;
      detachRegistrationListenerRef.current?.();
      detachRegistrationListenerRef.current = undefined;
      navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
      if (updateIntervalRef.current) {
        window.clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  const value = useMemo<AppUpdatesContextValue>(() => ({
    version,
    updateAvailable,
    offlineReady,
    checkingForUpdate,
    checkForUpdates,
    applyUpdate,
  }), [version, updateAvailable, offlineReady, checkingForUpdate, checkForUpdates, applyUpdate]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.AppUpdates = value;
    return () => {
      delete window.AppUpdates;
    };
  }, [value]);

  return (
    <AppUpdatesContext.Provider value={value}>
      {children}
    </AppUpdatesContext.Provider>
  );
}

export function useAppUpdates() {
  const context = useContext(AppUpdatesContext);
  if (!context) {
    throw new Error('useAppUpdates must be used within an AppUpdatesProvider');
  }

  return context;
}
