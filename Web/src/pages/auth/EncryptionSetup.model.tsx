import { useState } from "react";

import { useToast } from "@hooks/use-toast";
import { clearSession } from "@utils/clearSession";
import { CryptoPassRepository, User } from "@repositories";
import { EncryptionSetupViewModel } from "@layouts/auth/EncryptionSetup";
import { downloadEncryptionKeyFile } from "@features/security/downloadEncryptionKey";
import type { Progress } from "../../data/crypt/progress";

type UseEncryptionSetupModelParams = {
  user: User;
  onCompleted: () => void;
  onProgress?: (progress: Progress | null) => void;
};

const initPassword = window.isDevelopment ? "12345678" : "";

export function useEncryptionSetupModel({
  user,
  onCompleted,
  onProgress,
}: UseEncryptionSetupModelParams): EncryptionSetupViewModel {
  const { toast } = useToast();
  const LocalLang = Lang.auth.encryptionSetup;
  const [password, setPassword] = useState(initPassword);
  const [confirmPassword, setConfirmPassword] = useState(initPassword);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"password" | "backup">("password");
  const [keyDownloaded, setKeyDownloaded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    if (!password || password.length < 8) {
      const message = "Informe uma senha de pelo menos 8 caracteres para proteger seus dados.";
      setError(message);
      toast({
        title: "Senha muito curta",
        description: message,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      const message = "As senhas não coincidem.";
      setError(message);
      toast({
        title: "Senhas não coincidem",
        description: message,
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const repository = new CryptoPassRepository(user.id, onProgress);
      await repository.initSession(password);
      setStep("backup");
      toast({
        title: "Criptografia configurada",
        description: "Agora baixe sua chave de criptografia antes de concluir a entrada.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message || err.name : "Erro desconhecido.";
      setError(message);
      toast({
        title: "Falha ao configurar criptografia",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    setPassword: (value) => {
      setPassword(value);
      if (error) setError(null);
    },
    confirmPassword,
    setConfirmPassword: (value) => {
      setConfirmPassword(value);
      if (error) setError(null);
    },
    step,
    keyDownloaded,
    handleDownloadKey: async () => {
      try {
        setLoading(true);
        await downloadEncryptionKeyFile({ uid: user.id });
        setKeyDownloaded(true);
        toast({
          title: LocalLang.downloadKey,
          description: LocalLang.keyDownloaded,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message || err.name : "Erro desconhecido.";
        setError(message);
        toast({
          title: LocalLang.keyDownloadErrorTitle,
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    handleContinueAfterDownload: () => {
      if (!keyDownloaded) {
        const message = LocalLang.keyDownloadRequired;
        setError(message);
        toast({
          title: LocalLang.keyDownloadErrorTitle,
          description: message,
          variant: "destructive",
        });
        return;
      }
      onCompleted();
    },
    handleSubmit,
    handleSkip: () => {
      void clearSession();
    },
    loading,
    error,
  };
}
