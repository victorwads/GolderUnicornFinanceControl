import { useExportDataModel } from "./ExportData.model";
import ExportData from "@layouts/privacy/ExportData";

export default function ExportDataPage() {
  const model = useExportDataModel();
  return <ExportData model={model} />;
}
