import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export type AppUpdateCheckResult =
  | 'unsupported'
  | 'no-update'
  | 'update-available'
  | 'updated'
  | 'error';

export interface AppUpdatesContextValue {
  version: string;
  updateAvailable: boolean;
  offlineReady: boolean;
  checkingForUpdate: boolean;
  checkForUpdates: (options?: { applyIfAvailable?: boolean }) => Promise<AppUpdateCheckResult>;
  applyUpdate: () => Promise<void>;
}

const AppUpdatesContext = createContext<AppUpdatesContextValue | undefined>(undefined);

const ONE_HOUR = 1000 * 60 * 60;
const UPDATE_CHECK_TIMEOUT = 5000;

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
  const swUrlRef = useRef<string | null>(null);
  const updateIntervalRef = useRef<number>();
  const detachRegistrationListenerRef = useRef<(() => void) | undefined>();

  const waitForUpdate = useCallback(async (registration: ServiceWorkerRegistration) => {
    if (registration.waiting) {
      return true;
    }

    return await new Promise<boolean>((resolve) => {
      const cleanups: Array<() => void> = [];
      let settled = false;

      const finish = (result: boolean) => {
        if (settled) {
          return;
        }

        settled = true;
        cleanups.forEach((cleanup) => cleanup());
        resolve(result || Boolean(registration.waiting));
      };

      const observeWorker = (worker: ServiceWorker | null) => {
        if (!worker) {
          return;
        }

        const handleStateChange = () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            finish(true);
            return;
          }

          if (worker.state === 'redundant') {
            finish(Boolean(registration.waiting));
          }
        };

        worker.addEventListener('statechange', handleStateChange);
        cleanups.push(() => {
          worker.removeEventListener('statechange', handleStateChange);
        });

        handleStateChange();
      };

      const handleUpdateFound = () => {
        observeWorker(registration.installing);
      };

      registration.addEventListener('updatefound', handleUpdateFound);
      cleanups.push(() => {
        registration.removeEventListener('updatefound', handleUpdateFound);
      });

      observeWorker(registration.installing);

      const timeoutId = window.setTimeout(() => {
        finish(Boolean(registration.waiting));
      }, UPDATE_CHECK_TIMEOUT);

      cleanups.push(() => {
        window.clearTimeout(timeoutId);
      });
    });
  }, []);

  const checkForUpdates = useCallback(async (options?: { applyIfAvailable?: boolean }) => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return 'unsupported';
    }

    setCheckingForUpdate(true);
    try {
      const registration = registrationRef.current ?? await navigator.serviceWorker.getRegistration();
      if (!registration) {
        return 'unsupported';
      }

      registrationRef.current = registration;

      if (swUrlRef.current) {
        await fetch(swUrlRef.current, {
          cache: 'no-store',
          headers: {
            'cache-control': 'no-cache',
          },
        }).catch(() => undefined);
      }

      await registration.update();

      const hasUpdate = registration.waiting || await waitForUpdate(registration);
      if (!hasUpdate) {
        setUpdateAvailable(false);
        return 'no-update';
      }

      setUpdateAvailable(true);

      if (options?.applyIfAvailable && updateSWRef.current) {
        await updateSWRef.current(true);
        return 'updated';
      }

      return 'update-available';
    } catch (error) {
      console.error('Failed to check for updates', error);
      return 'error';
    } finally {
      setCheckingForUpdate(false);
    }
  }, [waitForUpdate]);

  const applyUpdate = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!updateSWRef.current) {
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
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
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
      onRegisteredSW(url, registration) {
        swUrlRef.current = url;
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
      swUrlRef.current = null;
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
