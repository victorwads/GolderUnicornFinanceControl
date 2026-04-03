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
  const LocalLang = Lang.visual.privacy;
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
          title: LocalLang.exportPartialTitle,
          description: LocalLang.exportErrorToastDescription(result.failedDomains.length),
        });
      } else {
        toast({
          title: LocalLang.exportSuccessTitle,
          description: LocalLang.exportSuccessToastDescription,
        });
      }
    } catch (error) {
      console.error("Failed to export data", error);
      setLastExportResult(null);
      toast({
        variant: "destructive",
        title: LocalLang.exportErrorTitle,
        description: Lang.settings.exportDataError,
      });
    }
  };

  const handleImportFiles = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setProgressType("import");
      setLastImportResult(null);
      const result = await importUserData(files, setProgress);
      setLastImportResult(result);
      if (result.failedFiles.length > 0) {
        toast({
          variant: "destructive",
          title: LocalLang.importPartialTitle,
          description: LocalLang.importPartialDescription(result.totalImportedCount, result.failedFiles.length),
        });
      } else {
        toast({
          title: LocalLang.importSuccessTitle,
          description: LocalLang.importSuccessDescription(result.totalImportedCount),
        });
      }
    } catch (error) {
      console.error("Failed to import data", error);
      setLastImportResult(null);
      toast({
        variant: "destructive",
        title: LocalLang.importErrorTitle,
        description: error instanceof Error ? error.message : LocalLang.importErrorDescription,
      });
    }
  };

  return {
    navigate,
    progress,
    progressType,
    lastImportResult,
    lastExportResult,
    handleExport,
    handleImportFiles,
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
          title: LocalLang.deleteInvalidConfirmationTitle,
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
          title: LocalLang.deleteErrorTitle,
          description: Lang.settings.deleteDataError,
        });
      }
    },
  };
}
