import { useNavigate } from "react-router-dom";

import { Langs, setLanguage } from "@lang";
import { Density, useCssVars } from "@componentsDeprecated/Vars";
import { useDensity } from "@contexts/DensityContext";
import { getServices } from "@services";
import { ProjectStorage } from "@utils/ProjectStorage";
import {
  SettingsRoute,
  ToMoreRoute,
  ToLanguageRoute,
  SettingsViewModel
} from "@layouts/settings/Settings";

export function useSettingsModel(): SettingsViewModel {
  const router = useNavigate();
  const { density, setDensity: setCssDensity } = useCssVars();
  const { setDensity: setVisualDensity } = useDensity();
  const { period } = getServices().timeline;
  const monthStartDay = [period.getCutOffDay()];
  const monthNameMode = period.getDisplayType();
  const selectedLanguage = SavedLang || "";

  const currentDensity = Number(density.split("-")[1] || 2);

  function navigate(route: SettingsRoute) {
    switch (true) {
      case route instanceof ToMoreRoute:
        router("/settings");
        break;

      case route instanceof ToLanguageRoute:
        router("/settings/language");
        break;

      default:
        console.warn('Unknown route type', route);
        break;
    }
  }

  return {
    navigate,
    monthStartDay,
    setMonthStartDay: (value) => {
      const nextDay = value[0];
      period.setConfig({ cutOffDay: nextDay });
      ProjectStorage.set("financeDay", String(nextDay));
    },
    monthNameMode,
    setMonthNameMode: (value) => {
      const nextMode = value as "start" | "next";
      period.setConfig({ displayType: nextMode });
      ProjectStorage.set("financeMode", nextMode);
    },
    currentLanguageLabel: selectedLanguage
      ? Langs[selectedLanguage]?.name ?? CurrentLangInfo.name
      : `Padrão do dispositivo (${navigator.language})`,
    density: currentDensity,
    setDensity: (value) => {
      const densityValue = `density-${value}` as Density;
      setCssDensity(densityValue);
      setVisualDensity(value);
    },
    syncLanguage: (value) => {
      setLanguage((value || undefined) as keyof typeof Langs | undefined);
    },
  };
}
