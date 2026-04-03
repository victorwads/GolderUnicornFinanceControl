import TimelineImport from "@layouts/core/TimelineImport";
import { useTimelineImportModel } from "./TimelineImport.model";

export default function TimelineImportPage() {
  const model = useTimelineImportModel();
  return <TimelineImport model={model} />;
}
