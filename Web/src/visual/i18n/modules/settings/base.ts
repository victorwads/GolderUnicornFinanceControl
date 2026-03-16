import type { Translation } from "../../core/types";

export default interface SettingsModuleTranslation extends Translation {
  settings: {
    title: string;
    data: string;
    myData: string;
    exportData: string;
    exportingData: (filename: string, current: string, max: string) => string;
    exportDataError: string;
    deleteData: string;
    deleteDataConfirm: string;
    deleteDataPrompt: (phrase: string) => string;
    deleteDataMismatch: string;
    deleteDataSuccess: string;
    deleteDataError: string;
    deleteDataPhrases: () => string[];
    deletingData: (filename: string, current: string, max: string) => string;
    auth: string;
    logout: string;
    clearLocalCaches: string;
    theme: string;
    density: string;
    loadingDatabaseUsage: string;
    language: string;
    toggleEncryption: (isDisabled: boolean) => string;
    resavingWithEncryption: (filename: string, current: string, max: string) => string;
    timelineMode: string;
    timelineModeStart: (day: number | string) => string;
    timelineModeNext: (day: number | string) => string;
    timelineCutoffDay: string;
    resetOnboarding: string;
    appVersion: string;
    checkUpdates: string;
    checkingUpdates: string;
    newUpdateAvailable: string;
    installUpdate: string;
    upToDate: string;
    offlineReady: string;
    speechRate: string;
    speechRateSlow: string;
    speechRateNormal: string;
    speechRateFast: string;
    enableVoice: string;
    testSpeech: string;
    selectVoice: string;
    testSpeechMessage: string;
    listVoices: string;
    hideVoices: string;
    availableVoices: string;
    assistantMode: {
      title: string;
      live: {
        name: string;
        description: string;
      };
      manual: {
        name: string;
        description: string;
      };
    };
    microphoneMode: {
      title: string;
      helper: string;
      hold: {
        name: string;
        description: string;
      };
      click: {
        name: string;
        description: string;
      };
    };
  };
}
