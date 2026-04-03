import { useState } from "react";

import { useToast } from "@hooks/use-toast";
import { clearSession } from "@utils/clearSession";
import { CryptoPassRepository, User } from "@repositories";
import { EncryptionUnlockViewModel } from "@layouts/auth/EncryptionUnlock";
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
  const [password, setPassword] = useState(initPassword);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

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

  return {
    password,
    setPassword: (value) => {
      setPassword(value);
      if (error) setError(null);
    },
    handleSubmit,
    handleLogout: () => {
      void clearSession();
    },
    loading,
    error,
  };
}
