import { useNavigate } from "react-router-dom";
import {
  ExportDataRoute,
  ToMoreRoute,
  ExportDataViewModel
} from "@layouts/privacy/ExportData";

export function useExportDataModel(): ExportDataViewModel {
  const router = useNavigate();

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

  const handleExport = (format: 'json' | 'csv') => {
    console.log(`Exporting data as ${format}`);
    // Implementar lógica de exportação
  };

  return {
    navigate,
    handleExport,
  };
}
