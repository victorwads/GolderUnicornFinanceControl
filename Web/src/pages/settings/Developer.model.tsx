import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useToast } from "@hooks/use-toast";
import type { DataProgressInfo } from "@components/DataProgress";
import { ProjectStorage } from "@utils/ProjectStorage";
import {
  killAccountRegisters,
  resetAssistantOnboarding,
  resetMicrophoneOnboarding,
  toggleEncryptionAndResave,
} from "@features/settings/settingsActions";
import {
  DeveloperRoute,
  DeveloperViewModel,
  ToMoreRoute,
} from "@layouts/settings/Developer";

export function useDeveloperModel(): DeveloperViewModel {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [killAccountId, setKillAccountId] = useState("");
  const [encryptionDisabled, setEncryptionDisabled] = useState(
    ProjectStorage.get("disableEncryption") === "true",
  );
  const [resaveProgress, setResaveProgress] = useState<DataProgressInfo | null>(null);

  function onNavigate(route: DeveloperRoute) {
    if (route instanceof ToMoreRoute) {
      navigate("/settings");
    }
  }

  return {
    navigate: onNavigate,
    encryptionDisabled,
    killAccountId,
    setKillAccountId,
    resaveProgress,
    openAiCalls: () => navigate("/ai-calls"),
    openSubscriptions: () => navigate("/subscriptions"),
    resetAssistantOnboarding: async () => {
      await resetAssistantOnboarding();
      toast({
        title: "Onboarding do assistente resetado",
        description: "O fluxo de onboarding do assistente foi liberado novamente.",
      });
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
