import { useState } from "react";

import { useToast } from "@hooks/use-toast";
import { clearSession } from "@utils/clearSession";
import { CryptoPassRepository, User } from "@repositories";
import { EncryptionSetupViewModel } from "@layouts/auth/EncryptionSetup";
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
  const [password, setPassword] = useState(initPassword);
  const [confirmPassword, setConfirmPassword] = useState(initPassword);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      toast({
        title: "Criptografia configurada",
        description: "Sua senha foi salva e os dados já podem ser descriptografados localmente.",
      });
      onCompleted();
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
    handleSubmit,
    handleSkip: () => {
      void clearSession();
    },
    loading,
    error,
  };
}
