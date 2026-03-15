import { useNavigate } from "react-router-dom";

import { Langs, setLanguage } from "@lang";

import {
  LanguageRoute,
  LanguageViewModel,
  ToSettingsRoute,
} from "@layouts/settings/Language";

export function useLanguageModel(): LanguageViewModel {
  const navigate = useNavigate();
  const LocalLang = Lang.visual.settings.languageScreen;

  function onNavigate(route: LanguageRoute) {
    if (route instanceof ToSettingsRoute) {
      navigate("/settings/app");
    }
  }

  const selectedLanguage = SavedLang || "";

  return {
    selectedLanguage,
    currentLanguageLabel: selectedLanguage
      ? Langs[selectedLanguage]?.name ?? CurrentLangInfo.name
      : `${CurrentLangInfo.name} (${navigator.language})`,
    languages: [
      {
        value: "",
        label: LocalLang.deviceDefault(navigator.language),
        description: LocalLang.deviceDefaultDescription,
      },
      ...Object.entries(Langs).map(([value, info]) => ({
        value,
        label: info.name,
        description: LocalLang.interfaceDescription(info.short),
      })),
    ],
    navigate: onNavigate,
    selectLanguage: (value) => {
      setLanguage((value || undefined) as keyof typeof Langs | undefined);
    },
  };
}
