import { useState, useEffect } from "react";
import { ProjectStorage } from '@utils/ProjectStorage';

import { SettingsSection } from "./types";
import "./VoicePreferencesSection.css";

const SPEECH_RATE_KEY = "speechRate";
const VOICE_NAME_KEY = "voiceNameV2";

function getRate(): number {
  const rate = Number(ProjectStorage.get(SPEECH_RATE_KEY + CurrentLang));
  if (!isNaN(rate) && rate >= 0.5 && rate <= 2.0) return rate;
  return 1.3;
}

export function getVoices() {
  if ("speechSynthesis" in window) {
    const miniLang = CurrentLang.split("-")[0];
    return speechSynthesis
      .getVoices()
      .filter(
        ({lang, localService}) =>
          (navigator.onLine || localService) &&
          (lang.startsWith(CurrentLang) || lang.startsWith(miniLang))
      );
  }
  return [];
}

// if has internet
if (navigator.onLine) {
  // Fetch voices from the server
}

let lastSpeakStop: (() => void) | null = null;
export function speak(text: string, rate?: number, volume?: number, important: boolean = false) {
  if (!("speechSynthesis" in window)) return Promise.resolve();
  lastSpeakStop?.();
  const savedVoiceName = ProjectStorage.get(VOICE_NAME_KEY + CurrentLang);

  const voices = getVoices()
  if (voices.length === 0) return Promise.resolve();
  const userLangVoice =
    voices.find(({name}) => name === savedVoiceName) ||
    // Apple best Portuguese voice
    voices.find(({name}) => name.toLocaleLowerCase().includes('fernanda')) ||
    voices.find(({localService}) => !localService) ||
    voices.find((lang) => lang.default) ||
    voices[0];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = userLangVoice;
  utterance.lang = CurrentLang;
  utterance.rate = rate || getRate();
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
      }
    }
  }).finally(() => {
    lastSpeakStop = null;
  });
}

const VoicePreferencesContent = () => {
  const [speechRate, setSpeechRate] = useState<number>(getRate());
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [showVoices, setShowVoices] = useState<boolean>(false);

  useEffect(() => {
    const loadVoices = () => setAvailableVoices(getVoices());
    if ("speechSynthesis" in window) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, []);

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setSpeechRate(newRate);
    ProjectStorage.set(SPEECH_RATE_KEY + CurrentLang, newRate.toString());
  };

  const toggleVoicesList = () => setShowVoices(!showVoices);
  const testSpeech = () => {
    speak(Lang.settings.testSpeechMessage);
  };

  return (
    <div className="VoiceSettings list">
      <div>
        <strong>{Lang.settings.speechRate}</strong>
        <div className="speech-rate-container">
          <span>{Lang.settings.speechRateSlow}</span>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speechRate}
            onChange={handleRateChange}
            className="speech-rate-slider"
          />
          <span>{Lang.settings.speechRateFast}</span>
          <span className="speech-rate-value">{speechRate.toFixed(1)}x</span>
        </div>
      </div>
      <div>
        <div className="buttons-container">
          <button onClick={testSpeech} className="test-speech-button">
            {Lang.settings.testSpeech}
          </button>
          <button onClick={toggleVoicesList} className="list-voices-button">
            {showVoices ? Lang.settings.hideVoices : Lang.settings.listVoices}
          </button>
        </div>
        {showVoices && (
          <div className="voices-list">
            <strong>
              {Lang.settings.availableVoices} ({availableVoices.length}):
            </strong>
            <ul>
              {availableVoices.map((voice, index) => (
                <li
                  key={index}
                  onClick={() => {
                    ProjectStorage.set(
                      VOICE_NAME_KEY + CurrentLang,
                      voice.name
                    );
                    speak("Ok.");
                  }}
                >
                  <strong>{voice.name}</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const section: SettingsSection = {
  id: "voice",
  title: "Voz e Áudio",
  content: <VoicePreferencesContent />,
};

export default section;
