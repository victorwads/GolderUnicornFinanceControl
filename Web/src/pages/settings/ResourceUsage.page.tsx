import { useResourceUsageModel } from "./ResourceUsage.model";
import ResourceUsage from "@layouts/settings/ResourceUsage";

export default function ResourceUsagePage() {
  const model = useResourceUsageModel();
  return <ResourceUsage model={model} />;
}
