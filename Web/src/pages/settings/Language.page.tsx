import Language from "@layouts/settings/Language";
import { useLanguageModel } from "./Language.model";

export default function LanguagePage() {
  const model = useLanguageModel();
  return <Language model={model} />;
}
