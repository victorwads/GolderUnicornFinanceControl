import { getSelectedVoiceName, getSpeechRate, isVoiceEnabled } from "./preferences";

export type SpeakOptions = {
  rate?: number;
  volume?: number;
  important?: boolean;
  force?: boolean;
};

let lastSpeakStop: (() => void) | null = null;

export function getVoices() {
  if (!("speechSynthesis" in window)) {
    return [];
  }

  const miniLang = CurrentLang.split("-")[0];
  return speechSynthesis
    .getVoices()
    .filter(
      ({ lang, localService }) =>
        (navigator.onLine || localService) &&
        (lang.startsWith(CurrentLang) || lang.startsWith(miniLang))
    );
}

export function speak(
  text: string,
  { rate, volume, important = false, force = false }: SpeakOptions = {}
): Promise<void> {
  if (!("speechSynthesis" in window) || (!isVoiceEnabled() && !force)) {
    return Promise.resolve();
  }

  lastSpeakStop?.();
  const savedVoiceName = getSelectedVoiceName();
  const voices = getVoices();

  if (voices.length === 0) {
    return Promise.resolve();
  }

  const selectedVoice =
    voices.find(({ name }) => name === savedVoiceName) ||
    voices.find(({ name }) => name.toLocaleLowerCase().includes("fernanda")) ||
    voices.find(({ localService }) => !localService) ||
    voices.find((voice) => voice.default) ||
    voices[0];

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = selectedVoice;
  utterance.lang = CurrentLang;
  utterance.rate = rate || getSpeechRate();
  utterance.volume = volume || 1;
  utterance.pitch = 1;

  return new Promise<void>((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);
    speechSynthesis.speak(utterance);

    if (!important) {
      lastSpeakStop = () => {
        speechSynthesis.cancel();
        lastSpeakStop = null;
        reject(new Error("Speech cancelled"));
      };
    }
  }).finally(() => {
    lastSpeakStop = null;
  });
}
