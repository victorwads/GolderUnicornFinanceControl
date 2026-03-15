import { ProjectStorage } from "@utils/ProjectStorage";

const ASSISTANT_MODE_KEY = "assistantMode";
const MICROPHONE_MODE_KEY = "assistantMicrophoneMode";
const SPEECH_RATE_KEY = "speechRate";
const VOICE_NAME_KEY = "voiceNameV2";
const USE_SPEECH_KEY = "useSpeech";

export type AssistantMode = "live" | "manual";
export type AssistantMicrophoneMode = "hold" | "click";

export function getAssistantMode(): AssistantMode {
  return (ProjectStorage.get(ASSISTANT_MODE_KEY) as AssistantMode) || "live";
}

export function setAssistantMode(mode: AssistantMode) {
  ProjectStorage.set(ASSISTANT_MODE_KEY, mode);
}

export function getAssistantMicrophoneMode(): AssistantMicrophoneMode {
  return (ProjectStorage.get(MICROPHONE_MODE_KEY) as AssistantMicrophoneMode) || "click";
}

export function setAssistantMicrophoneMode(mode: AssistantMicrophoneMode) {
  ProjectStorage.set(MICROPHONE_MODE_KEY, mode);
}

export function getSpeechRate(): number {
  const rate = Number(ProjectStorage.get(SPEECH_RATE_KEY + CurrentLang));
  return !Number.isNaN(rate) && rate >= 0.5 && rate <= 2 ? rate : 1.3;
}

export function setSpeechRate(rate: number) {
  ProjectStorage.set(SPEECH_RATE_KEY + CurrentLang, rate.toString());
}

export function isVoiceEnabled(): boolean {
  return ProjectStorage.get(USE_SPEECH_KEY) === "true";
}

export function setVoiceEnabled(enabled: boolean) {
  if (enabled) {
    ProjectStorage.set(USE_SPEECH_KEY, "true");
    return;
  }

  ProjectStorage.remove(USE_SPEECH_KEY);
}

export function getSelectedVoiceName(): string {
  return ProjectStorage.get(VOICE_NAME_KEY + CurrentLang) || "";
}

export function setSelectedVoiceName(voiceName: string) {
  ProjectStorage.set(VOICE_NAME_KEY + CurrentLang, voiceName);
}
