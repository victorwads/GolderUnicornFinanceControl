import { useNavigate } from "react-router-dom";
import { useToast } from "@hooks/use-toast";
import { exportUserData } from "@features/settings/settingsActions";
import {
  ExportDataRoute,
  ToMoreRoute,
  ExportDataViewModel
} from "@layouts/privacy/ExportData";

export function useExportDataModel(): ExportDataViewModel {
  const router = useNavigate();
  const { toast } = useToast();

  function navigate(route: ExportDataRoute) {
    switch (true) {
      case route instanceof ToMoreRoute:
        router("/settings");
        break;

      default:
        console.warn('Unknown route type', route);
        break;
    }
  }

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      await exportUserData(format);
      toast({
        title: "Exportação concluída",
        description: "Seus dados foram exportados com sucesso.",
      });
    } catch (error) {
      console.error("Failed to export data", error);
      toast({
        variant: "destructive",
        title: "Falha ao exportar dados",
        description: Lang.settings.exportDataError,
      });
    }
  };

  return {
    navigate,
    handleExport,
  };
}
