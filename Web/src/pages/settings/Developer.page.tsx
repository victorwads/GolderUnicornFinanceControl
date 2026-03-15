import Developer from "@layouts/settings/Developer";
import { useDeveloperModel } from "./Developer.model";

export default function DeveloperPage() {
  const model = useDeveloperModel();
  return <Developer model={model} />;
}
