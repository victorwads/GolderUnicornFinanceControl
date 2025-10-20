import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SettingsRoute,
  ToMoreRoute,
  ToLanguageRoute,
  SettingsViewModel
} from "@layouts/settings/Settings";

export function useSettingsModel(): SettingsViewModel {
  const router = useNavigate();
  const [monthStartDay, setMonthStartDay] = useState([15]);
  const [monthNameMode, setMonthNameMode] = useState("current");

  function navigate(route: SettingsRoute) {
    switch (true) {
      case route instanceof ToMoreRoute:
        router("/more");
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
    setMonthStartDay,
    monthNameMode,
    setMonthNameMode,
  };
}
