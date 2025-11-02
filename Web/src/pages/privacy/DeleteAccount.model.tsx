import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { DeleteAccountViewModel } from "@layouts/privacy/DeleteAccount";
import type { DataProgressInfo } from "@components/DataProgress";

const domains = [
  { name: "Transações", items: 5420 },
  { name: "Contas", items: 12 },
  { name: "Cartões", items: 8 },
  { name: "Categorias", items: 45 },
  { name: "Configurações", items: 1 },
];

export function useDeleteAccountModel(): DeleteAccountViewModel {
  const navigate = useNavigate();
  const [deleteProgress, setDeleteProgress] = useState<DataProgressInfo | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const simulateDeleteProgress = async () => {
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      
      setDeleteProgress({
        domain: domain.name,
        current: i + 1,
        max: domains.length,
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      const batchSize = 500;
      const batches = Math.ceil(domain.items / batchSize);
      
      for (let j = 0; j < batches; j++) {
        const current = Math.min((j + 1) * batchSize, domain.items);
        setDeleteProgress({
          domain: domain.name,
          current: i + 1,
          max: domains.length,
          sub: {
            current,
            max: domain.items,
          },
        });
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
      }
    }

    setDeleteProgress(null);
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const handleDelete = () => {
    if (confirmText === "EXCLUIR") {
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    setShowDeleteDialog(false);
    await simulateDeleteProgress();
  };

  return {
    navigate,
    deleteProgress,
    confirmText,
    setConfirmText,
    showDeleteDialog,
    setShowDeleteDialog,
    handleDelete,
    confirmDelete,
  };
}
