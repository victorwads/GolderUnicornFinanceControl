import Settings from "@layouts/settings/Settings";
import { useSettingsModel } from "./Settings.model";

export default function SettingsPage() {
  const model = useSettingsModel();
  return <Settings model={model} />;
}
