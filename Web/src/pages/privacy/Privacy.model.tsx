import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PrivacyViewModel } from "@layouts/privacy/Privacy";
import type { DataProgressInfo } from "@components/DataProgress";
import { useToast } from "@hooks/use-toast";
import {
  deleteAllUserData,
  exportUserData,
  importUserData,
  type ImportUserDataResult,
  type ExportUserDataResult,
} from "@features/settings/settingsActions";

export function usePrivacyModel(): PrivacyViewModel {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [progress, setProgress] = useState<DataProgressInfo | null>(null);
  const [progressType, setProgressType] = useState<"export" | "delete" | "import">("export");
  const [lastImportResult, setLastImportResult] = useState<ImportUserDataResult | null>(null);
  const [lastExportResult, setLastExportResult] = useState<ExportUserDataResult | null>(null);
  const [showDeleteDataDialog, setShowDeleteDataDialog] = useState(false);
  const [deleteDataConfirmation, setDeleteDataConfirmation] = useState("");
  const [deleteDataPhrase, setDeleteDataPhrase] = useState("");

  const handleExport = async (format: "json" | "csv") => {
    try {
      setProgressType("export");
      setLastExportResult(null);
      const result = await exportUserData(format, setProgress);
      setLastExportResult(result);

      if (result.failedDomains.length > 0) {
        toast({
          variant: "destructive",
          title: "Exportação concluída com erros",
          description: `O arquivo foi gerado, mas houve falha em ${result.failedDomains.length} seção(ões).`,
        });
      } else {
        toast({
          title: "Exportação concluída",
          description: "Seus dados foram exportados com sucesso.",
        });
      }
    } catch (error) {
      console.error("Failed to export data", error);
      setLastExportResult(null);
      toast({
        variant: "destructive",
        title: "Falha ao exportar dados",
        description: Lang.settings.exportDataError,
      });
    }
  };

  const handleImportFile = async (file: File | null) => {
    if (!file) return;

    try {
      setProgressType("import");
      setLastImportResult(null);
      const result = await importUserData(file, setProgress);
      setLastImportResult(result);
      toast({
        title: "Importação concluída",
        description: `${result.importedCount} item(ns) importados de ${result.domain}.`,
      });
    } catch (error) {
      console.error("Failed to import data", error);
      setLastImportResult(null);
      toast({
        variant: "destructive",
        title: "Falha ao importar dados",
        description: error instanceof Error ? error.message : "Import failed",
      });
    }
  };

  return {
    navigate,
    isDeveloperMode: window.isDevelopment,
    progress,
    progressType,
    lastImportResult,
    lastExportResult,
    handleExport,
    handleImportFile,
    showDeleteDataDialog,
    setShowDeleteDataDialog,
    deleteDataPhrase,
    deleteDataConfirmation,
    setDeleteDataConfirmation,
    openDeleteDataDialog: () => {
      const phrases = Lang.settings.deleteDataPhrases();
      const phrase = phrases[Math.floor(Math.random() * phrases.length)] || phrases[0] || Lang.settings.deleteData;
      setDeleteDataPhrase(phrase);
      setDeleteDataConfirmation("");
      setShowDeleteDataDialog(true);
    },
    confirmDeleteData: async () => {
      if (deleteDataConfirmation.trim() !== deleteDataPhrase) {
        toast({
          variant: "destructive",
          title: "Confirmação inválida",
          description: Lang.settings.deleteDataMismatch,
        });
        return;
      }

      try {
        setShowDeleteDataDialog(false);
        setProgressType("delete");
        await deleteAllUserData(setProgress);
      } catch (error) {
        console.error("Failed to delete user data", error);
        toast({
          variant: "destructive",
          title: "Falha ao excluir dados",
          description: Lang.settings.deleteDataError,
        });
      }
    },
  };
}
