import Privacy from "@layouts/privacy/Privacy";
import { usePrivacyModel } from "./Privacy.model";

export default function PrivacyPage() {
  const model = usePrivacyModel();
  return <Privacy model={model} />;
}
