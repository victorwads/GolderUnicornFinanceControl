import { useState } from "react";

import { useToast } from "@hooks/use-toast";
import { clearSession } from "@utils/clearSession";
import { CryptoPassRepository, User } from "@repositories";
import { EncryptionUnlockViewModel } from "@layouts/auth/EncryptionUnlock";
import { readEncryptionKeyFile, buildEncryptionKeyFileName } from "@features/security/downloadEncryptionKey";
import Encryptor from "../../data/crypt/Encryptor";
import type { Progress } from "../../data/crypt/progress";

type UseEncryptionUnlockModelParams = {
  user: User;
  onCompleted: () => void;
  onProgress?: (progress: Progress | null) => void;
};

const initPassword = window.isDevelopment ? "12345678" : "";

export function useEncryptionUnlockModel({
  user,
  onCompleted,
  onProgress,
}: UseEncryptionUnlockModelParams): EncryptionUnlockViewModel {
  const { toast } = useToast();
  const LocalLang = Lang.auth.encryptionUnlock;
  const [password, setPassword] = useState(initPassword);
  const [mode, setMode] = useState<"password" | "recovery">("password");
  const [recoveryFileName, setRecoveryFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    if (mode === "recovery") {
      return;
    }

    if (!password) {
      const message = "Informe sua senha de criptografia.";
      setError(message);
      toast({
        title: "Senha obrigatória",
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
      toast({
        title: "Criptografia desbloqueada",
        description: "Seus dados locais foram carregados com sucesso.",
      });
      onCompleted();
    } catch (err) {
      const message = err instanceof Error ? err.message || err.name : "Erro desconhecido.";
      setError(message);
      toast({
        title: "Falha ao desbloquear criptografia",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecoveryFile = async (file?: File | null) => {
    if (!file || loading) return;

    setError(null);
    setLoading(true);

    try {
      const payload = await readEncryptionKeyFile(file);
      if (payload.userId !== user.id) {
        throw new Error(LocalLang.recoveryWrongAccount);
      }

      const repository = new CryptoPassRepository(user.id, onProgress);
      await repository.initSessionWithHash(Encryptor.hashFromHex(payload.secretHash));
      setRecoveryFileName(file.name);
      toast({
        title: LocalLang.recoverySuccessTitle,
        description: LocalLang.recoverySuccessDescription,
      });
      onCompleted();
    } catch (err) {
      const message = err instanceof Error ? err.message || err.name : "Erro desconhecido.";
      setError(message);
      setRecoveryFileName(null);
      toast({
        title: LocalLang.recoveryErrorTitle,
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    password,
    setPassword: (value) => {
      setPassword(value);
      if (error) setError(null);
    },
    recoveryFileName,
    recoveryExampleFileName: buildEncryptionKeyFileName(user.id),
    openRecovery: () => {
      setMode("recovery");
      setError(null);
    },
    closeRecovery: () => {
      setMode("password");
      setRecoveryFileName(null);
      setError(null);
    },
    handleRecoveryFile,
    handleSubmit,
    handleLogout: () => {
      void clearSession();
    },
    loading,
    error,
  };
}
