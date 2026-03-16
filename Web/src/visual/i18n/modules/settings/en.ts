import type SettingsModuleTranslation from './base';

const en: SettingsModuleTranslation = {
  settings: {
    title: "Settings",
    data: "Data",
    myData: "My Data",
    exportData: "Export My Data",
    exportingData: (filename,current,max)=>`Exporting ${filename} (${current}/${max})%`,
    exportDataError: "We could not export your data. Please try again.",
    deleteData: "Delete all my data",
    deleteDataConfirm: "Are you sure? Your data will be exported and permanently deleted.",
    deleteDataPrompt: phrase=>`Type "${phrase}" to confirm.`,
    deleteDataMismatch: "The confirmation phrase did not match. Nothing was deleted.",
    deleteDataSuccess: "All of your data has been deleted. You will be signed out next.",
    deleteDataError: "We could not complete the data deletion. Please try again.",
    deleteDataPhrases: ()=>["I accept deleting all my data","Delete all of my account data","I understand this action is irreversible","Remove everything about my account","Yes, erase all my data now"],
    deletingData: (filename,current,max)=>`Deleting ${filename} (${current}/${max})...`,
    auth: "Auth",
    logout: "Logout",
    clearLocalCaches: "Clear local caches",
    resetOnboarding: "Reset onboarding",
    theme: "Theme",
    density: "Density",
    loadingDatabaseUsage: "Loading database usage...",
    language: "Language",
    toggleEncryption: disabled=>disabled?"Enable Encryption (DEV only)":"Disable Encryption (DEV only)",
    resavingWithEncryption: (filename,current,max)=>`Resaving ${filename} (${current}/${max})...`,
    timelineMode: "Mode (to define the name of the financial month)",
    timelineModeStart: day=>`Name of the current month up to day ${day}`,
    timelineModeNext: day=>`Name of the next month after day ${day}`,
    timelineCutoffDay: "Cut-off day",
    appVersion: "App version",
    checkUpdates: "Check for updates",
    checkingUpdates: "Checking for updates...",
    newUpdateAvailable: "A new version is available",
    installUpdate: "Reload to update",
    upToDate: "You are on the latest version",
    offlineReady: "Available offline",
    speechRate: "Speech Rate",
    speechRateSlow: "Slow",
    speechRateNormal: "Normal",
    speechRateFast: "Fast",
    enableVoice: "Enable voice",
    testSpeech: "Test Speech",
    selectVoice: "Select voice",
    testSpeechMessage: "This is a test message to exemplify my speech.",
    listVoices: "List Voices",
    hideVoices: "Hide Voices",
    availableVoices: "Available Voices",
    assistantMode: {
      title: "Assistant mode",
      live: {
        name: "Live mode",
        description: "The assistant listens continuously and responds automatically when you stop speaking. Ideal for natural and fluid conversations.",
      },
      manual: {
        name: "Manual mode",
        description: "You control when the assistant should listen. Press the microphone button to speak and press again to send. More control and privacy.",
      },
    },
    microphoneMode: {
      title: "Microphone mode",
      helper: "These options only appear in manual mode, where you choose exactly how to start and stop capture.",
      hold: {
        name: "Hold to talk",
        description: "Press and hold the button while speaking",
      },
      click: {
        name: "Click to start / Click to stop",
        description: "Click once to start and click again to finish",
      },
    }
  }
};

export default en;
