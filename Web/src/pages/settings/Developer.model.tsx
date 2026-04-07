import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "@hooks/use-toast";
import type { DataProgressInfo } from "@components/DataProgress";
import { ProjectStorage } from "@utils/ProjectStorage";
import {
  getAssistantOnboardingEnabled,
  killAccountRegisters,
  resetMicrophoneOnboarding,
  setAssistantOnboardingEnabled,
  toggleEncryptionAndResave,
} from "@features/settings/settingsActions";
import {
  DeveloperRoute,
  DeveloperViewModel,
  ToMoreRoute,
} from "@layouts/settings/Developer";
import { isDeveloperOptionsEnabled, setDeveloperOptionsEnabled } from "./developerOptions";

const LEGACY_THEME_KEY = `${ProjectStorage.PREFIX}theme`;
const LEGACY_DENSITY_KEY = `${ProjectStorage.PREFIX}densityV2`;
const LEGACY_AUTH_CACHE_KEY = `${ProjectStorage.PREFIX}firebase:authUser:synccache`;
const LEGACY_ACCOUNTS_KEY = `${ProjectStorage.PREFIX}ACCOUNTS`;
const CRYPTO_TOKEN_PREFIX = `${ProjectStorage.PREFIX}crypto.token.`;
const CRYPTO_SECRET_HASH_PREFIX = `${ProjectStorage.PREFIX}crypto.secretHash.`;

const VISUAL_LOCAL_STORAGE_KEYS = [
  "app-density",
  "color-theme",
  "theme",
  LEGACY_THEME_KEY,
  LEGACY_DENSITY_KEY,
];

const USER_LOCAL_STORAGE_KEYS = [
  "isLoggedIn",
  LEGACY_AUTH_CACHE_KEY,
  LEGACY_ACCOUNTS_KEY,
];

function removeKeys(
  storage: Storage,
  options: { keys?: string[]; prefixes?: string[] },
): number {
  const keys = Object.keys(storage);
  const keysToRemove = new Set<string>();

  options.keys?.forEach((key) => {
    if (storage.getItem(key) !== null) {
      keysToRemove.add(key);
    }
  });

  options.prefixes?.forEach((prefix) => {
    keys
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => keysToRemove.add(key));
  });

  keysToRemove.forEach((key) => storage.removeItem(key));
  return keysToRemove.size;
}

export function useDeveloperModel(): DeveloperViewModel {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [killAccountId, setKillAccountId] = useState("");
  const [assistantOnboardingEnabled, setAssistantOnboardingEnabledState] = useState(false);
  const [assistantOnboardingLoading, setAssistantOnboardingLoading] = useState(true);
  const [assistantOnboardingPending, setAssistantOnboardingPending] = useState(false);
  const [encryptionDisabled, setEncryptionDisabled] = useState(
    ProjectStorage.get("disableEncryption") === "true",
  );
  const [resaveProgress, setResaveProgress] = useState<DataProgressInfo | null>(null);

  useEffect(() => {
    if (!isDeveloperOptionsEnabled()) {
      navigate("/settings");
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    setAssistantOnboardingLoading(true);
    getAssistantOnboardingEnabled()
      .then((enabled) => {
        if (!cancelled) {
          setAssistantOnboardingEnabledState(enabled);
        }
      })
      .catch((error) => {
        console.error("Failed to load assistant onboarding status", error);
        if (!cancelled) {
          toast({
            variant: "destructive",
            title: "Falha ao carregar onboarding",
            description: "Não foi possível consultar o estado do onboarding do assistente.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAssistantOnboardingLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [toast]);

  function onNavigate(route: DeveloperRoute) {
    if (route instanceof ToMoreRoute) {
      navigate("/settings");
    }
  }

  function confirmAndClearStorage(config: {
    title: string;
    description: string;
    localStorageKeys?: string[];
    localStoragePrefixes?: string[];
    sessionStorageKeys?: string[];
    sessionStoragePrefixes?: string[];
  }) {
    if (!window.confirm(config.description)) {
      return;
    }

    const removedLocal = removeKeys(window.localStorage, {
      keys: config.localStorageKeys,
      prefixes: config.localStoragePrefixes,
    });
    const removedSession = removeKeys(window.sessionStorage, {
      keys: config.sessionStorageKeys,
      prefixes: config.sessionStoragePrefixes,
    });
    const totalRemoved = removedLocal + removedSession;

    toast({
      title: config.title,
      description:
        totalRemoved > 0
          ? `${totalRemoved} chave(s) locais removidas. A página será recarregada para aplicar o reset.`
          : "Nenhuma chave correspondente foi encontrada. A página será recarregada para garantir o estado limpo.",
    });

    window.setTimeout(() => {
      window.location.reload();
    }, 900);
  }

  return {
    navigate: onNavigate,
    encryptionDisabled,
    killAccountId,
    setKillAccountId,
    resaveProgress,
    openSubscriptions: () => navigate("/subscriptions"),
    disableDeveloperOptions: () => {
      setDeveloperOptionsEnabled(false);
      toast({
        title: "Developer options disabled",
        description: "Advanced options were hidden again.",
      });
      navigate("/settings");
    },
    clearVisualSettings: () => {
      confirmAndClearStorage({
        title: "Preferências visuais limpas",
        description:
          "Isso vai remover App Density, Color Theme e preferências de tema salvas localmente. Deseja continuar?",
        localStorageKeys: VISUAL_LOCAL_STORAGE_KEYS,
      });
    },
    clearUserSettings: () => {
      confirmAndClearStorage({
        title: "Dados locais do usuário limpos",
        description:
          "Isso vai remover cache de usuário, indicadores de login e credenciais locais de criptografia. Deseja continuar?",
        localStorageKeys: USER_LOCAL_STORAGE_KEYS,
        localStoragePrefixes: [CRYPTO_TOKEN_PREFIX],
        sessionStoragePrefixes: [CRYPTO_SECRET_HASH_PREFIX],
      });
    },
    clearAllLocalSettings: () => {
      confirmAndClearStorage({
        title: "Dados locais limpos",
        description:
          "Isso vai remover preferências visuais e dados locais do usuário nesta máquina. Deseja continuar?",
        localStorageKeys: [...VISUAL_LOCAL_STORAGE_KEYS, ...USER_LOCAL_STORAGE_KEYS],
        localStoragePrefixes: [CRYPTO_TOKEN_PREFIX],
        sessionStoragePrefixes: [CRYPTO_SECRET_HASH_PREFIX],
      });
    },
    assistantOnboardingEnabled,
    assistantOnboardingLoading,
    assistantOnboardingPending,
    toggleAssistantOnboarding: async (enabled: boolean) => {
      setAssistantOnboardingPending(true);

      try {
        await setAssistantOnboardingEnabled(enabled);
        setAssistantOnboardingEnabledState(enabled);
        toast({
          title: enabled
            ? "Onboarding do assistente ativado"
            : "Onboarding do assistente desativado",
          description: enabled
            ? "Novas conversas voltam a iniciar no fluxo de onboarding."
            : "Novas conversas deixam de iniciar no fluxo de onboarding.",
        });

        window.setTimeout(() => {
          window.location.reload();
        }, 900);
      } catch (error) {
        console.error("Failed to toggle assistant onboarding", error);
        toast({
          variant: "destructive",
          title: "Falha ao atualizar onboarding",
          description: "Não foi possível salvar o estado do onboarding do assistente.",
        });
      } finally {
        setAssistantOnboardingPending(false);
      }
    },
    resetMicrophoneOnboarding: () => {
      resetMicrophoneOnboarding();
      toast({
        title: "Onboarding do microfone resetado",
        description: "O fluxo de voz pode ser exibido novamente.",
      });
    },
    toggleEncryption: async () => {
      try {
        const newValue = await toggleEncryptionAndResave(
          encryptionDisabled,
          setResaveProgress,
        );
        setEncryptionDisabled(newValue);
        toast({
          title: "Criptografia atualizada",
          description: newValue
            ? "Criptografia desativada e regravação concluída."
            : "Criptografia ativada e regravação concluída.",
        });
      } catch (error) {
        console.error("Failed to toggle encryption", error);
        toast({
          variant: "destructive",
          title: "Falha ao alternar criptografia",
          description: "Não foi possível regravar os repositórios criptografados.",
        });
      }
    },
    killAccountRegisters: async () => {
      const accountId = killAccountId.trim();
      if (!accountId) {
        toast({
          variant: "destructive",
          title: "Informe uma conta",
          description: "Preencha o ID da conta antes de executar a limpeza.",
        });
        return;
      }

      if (!window.confirm("Tem certeza que deseja remover permanentemente todos os registros desta conta?")) {
        return;
      }

      try {
        const { deletedCount, accountName } = await killAccountRegisters(accountId);
        toast({
          title: "Registros removidos",
          description: `${deletedCount} registros removidos${accountName ? ` de ${accountName}` : ""}.`,
        });
        setKillAccountId("");
      } catch (error) {
        console.error("Failed to delete account registers", error);
        toast({
          variant: "destructive",
          title: "Falha ao remover registros",
          description: "Não foi possível excluir os registros da conta informada.",
        });
      }
    },
  };
}
