import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Langs, setLanguage } from "@lang";
import { Density, useCssVars } from "@componentsDeprecated/Vars";
import { useDensity } from "@contexts/DensityContext";
import { getServices } from "@services";
import { ProjectStorage } from "@utils/ProjectStorage";
import { getVoices, speak } from "@features/tabs/settings/sections/VoicePreferencesSection";
import {
  getAssistantMicrophoneMode,
  getAssistantMode,
  getSelectedVoiceName,
  getSpeechRate,
  isVoiceEnabled,
  setAssistantMicrophoneMode,
  setAssistantMode,
  setSelectedVoiceName,
  setSpeechRate as persistSpeechRate,
  setVoiceEnabled,
} from "@features/assistant/preferences";
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
  const [assistantMode, setAssistantModeState] = useState<"live" | "manual">(() => getAssistantMode());
  const [microphoneMode, setMicrophoneModeState] = useState<"hold" | "click">(() => getAssistantMicrophoneMode());
  const [voiceEnabled, setVoiceEnabledState] = useState(() => isVoiceEnabled());
  const [speechRate, setSpeechRateState] = useState(() => getSpeechRate());
  const [availableVoices, setAvailableVoices] = useState<string[]>([]);
  const [selectedVoice, setSelectedVoiceState] = useState(() => getSelectedVoiceName());

  const currentDensity = Number(density.split("-")[1] || 2);

  useEffect(() => {
    const syncVoices = () => {
      const voices = getVoices().map((voice) => voice.name);
      setAvailableVoices(voices);
      if (!selectedVoice && voices[0]) setSelectedVoiceState(voices[0]);
    };

    syncVoices();
    if ("speechSynthesis" in window) {
      speechSynthesis.onvoiceschanged = syncVoices;
    }
    return () => {
      if ("speechSynthesis" in window) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoice]);

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
      : Lang.visual.settings.languageScreen.deviceDefault(navigator.language),
    density: currentDensity,
    setDensity: (value) => {
      const densityValue = `density-${value}` as Density;
      setCssDensity(densityValue);
      setVisualDensity(value);
    },
    syncLanguage: (value) => {
      setLanguage((value || undefined) as keyof typeof Langs | undefined);
    },
    voiceSettings: {
      voiceEnabled,
      onVoiceEnabledChange: (enabled) => {
        setVoiceEnabledState(enabled);
        setVoiceEnabled(enabled);
      },
      speechRate,
      onSpeechRateChange: (rate) => {
        setSpeechRateState(rate);
        persistSpeechRate(rate);
      },
      selectedVoice,
      availableVoices,
      onSelectedVoiceChange: (voice) => {
        setSelectedVoiceState(voice);
        setSelectedVoiceName(voice);
      },
      onTestVoice: () => {
        void speak(Lang.settings.testSpeechMessage, { force: true, rate: speechRate }).then(() => {
          setVoiceEnabledState(true);
          setVoiceEnabled(true);
        });
      },
    },
    assistantBehavior: {
      assistantMode,
      onAssistantModeChange: (mode) => {
        setAssistantModeState(mode);
        setAssistantMode(mode);
      },
      microphoneMode,
      onMicrophoneModeChange: (mode) => {
        setMicrophoneModeState(mode);
        setAssistantMicrophoneMode(mode);
      },
    },
  };
}
