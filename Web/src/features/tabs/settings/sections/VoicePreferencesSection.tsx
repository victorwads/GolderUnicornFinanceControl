import { useState, useEffect } from "react";
import { SettingsSection } from "./types";
import "./VoicePreferencesSection.css";

const SPEECH_RATE_KEY = "speechRate";
const VOICE_NAME_KEY = "voiceName";

function getRate(): number {
  const rate = Number(localStorage.getItem(SPEECH_RATE_KEY + CurrentLang));
  if (!isNaN(rate) && rate >= 0.5 && rate <= 2.0) return rate;
  return 1.3;
}

export function getVoices() {
  if ("speechSynthesis" in window) {
    const miniLang = CurrentLang.split("-")[0];
    return speechSynthesis
      .getVoices()
      .filter(
        (voice) =>
          voice.lang.startsWith(CurrentLang) || voice.lang.startsWith(miniLang)
      );
  }
  return [];
}

export function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  const miniLang = CurrentLang.split("-")[0];
  const savedVoiceName = localStorage.getItem(VOICE_NAME_KEY + CurrentLang);

  const voices = speechSynthesis.getVoices();
  const userLangVoice =
    voices.find((voice) => voice.name === savedVoiceName) ||
    voices.find(
      (voice) =>
        voice.name.toLocaleLowerCase().includes("google") &&
        voice.lang.includes(CurrentLang)
    ) ||
    voices.find(
      (voice) =>
        voice.name.toLocaleLowerCase().includes("google") &&
        voice.lang.startsWith(miniLang)
    ) ||
    voices.find((voice) => voice.lang.includes(CurrentLang)) ||
    voices.find((voice) => voice.lang.startsWith(miniLang)) ||
    voices[0];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = userLangVoice;
  utterance.lang = CurrentLang;
  utterance.rate = getRate();
  utterance.pitch = 1;

  return new Promise<void>((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    speechSynthesis.speak(utterance);
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
    localStorage.setItem(SPEECH_RATE_KEY + CurrentLang, newRate.toString());
  };

  const toggleVoicesList = () => setShowVoices(!showVoices);
  const testSpeech = () => {
    speak(Lang.settings.testSpeechMessage);
  };

  return (
    <div className="VoiceSettings">
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
                    localStorage.setItem(
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
