import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";

import { functions } from "@configs";
import { useToast } from "@hooks/use-toast";
import { exportUserData } from "@features/settings/settingsActions";
import type { DeleteAccountViewModel } from "@layouts/privacy/DeleteAccount";
import type { DataProgressInfo } from "@components/DataProgress";
import { clearSession } from "@utils/clearSession";

const deleteAccountData = httpsCallable<undefined, { success: boolean }>(functions, "deleteAccountData");

export function useDeleteAccountModel(): DeleteAccountViewModel {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteProgress, setDeleteProgress] = useState<DataProgressInfo | null>(null);
  const [deleteProgressType, setDeleteProgressType] = useState<"export" | "delete">("delete");
  const [confirmText, setConfirmText] = useState("");
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    if (confirmText === "EXCLUIR") {
      setShowBackupDialog(true);
    }
  };

  const handleBackupDownload = async () => {
    try {
      setDeleteProgressType("export");
      const exportResult = await exportUserData("json", setDeleteProgress);

      if (exportResult.failedDomains.length > 0) {
        throw new Error(
          `Não foi possível gerar um backup completo antes da exclusão: ${exportResult.failedDomains
            .map(({ domain }) => domain)
            .join(", ")}`,
        );
      }

      setShowBackupDialog(false);
      setShowDeleteDialog(true);
      toast({
        title: "Backup baixado",
        description: "Revise a confirmação final antes de excluir sua conta.",
      });
    } catch (error) {
      console.error("Failed to export backup before account deletion", error);
      setDeleteProgressType("delete");
      setDeleteProgress(null);
      toast({
        variant: "destructive",
        title: "Falha ao baixar backup",
        description: error instanceof Error
          ? error.message
          : "Não foi possível gerar o backup antes da exclusão.",
      });
    }
  };

  const confirmDelete = async () => {
    setShowDeleteDialog(false);

    try {
      setDeleteProgressType("delete");
      setDeleteProgress({
        domain: "Conta",
        current: 1,
        max: 2,
      });

      const result = await deleteAccountData();

      if (!result.data?.success) {
        throw new Error("A exclusão da conta não foi confirmada pelo servidor.");
      }

      setDeleteProgress({
        domain: "Sessão local",
        current: 2,
        max: 2,
      });

      toast({
        title: "Conta excluída",
        description: "Sua conta foi removida. Limpando a sessão local...",
      });

      await clearSession();
    } catch (error) {
      console.error("Failed to delete account", error);
      setDeleteProgressType("delete");
      setDeleteProgress(null);
      toast({
        variant: "destructive",
        title: "Falha ao excluir conta",
        description: error instanceof Error
          ? error.message
          : "Não foi possível excluir sua conta agora.",
      });
    }
  };

  return {
    navigate,
    deleteProgress,
    deleteProgressType,
    confirmText,
    setConfirmText,
    showBackupDialog,
    setShowBackupDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    handleDelete,
    handleBackupDownload,
    confirmDelete,
  };
}
