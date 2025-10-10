import { useState, useEffect } from 'react';
import { SettingsSection } from './types';

const SPEECH_RATE_KEY = 'speechRate';

const VoicePreferencesContent = () => {
  const [speechRate, setSpeechRate] = useState<number>(1.3);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showVoices, setShowVoices] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem(SPEECH_RATE_KEY);
    if (saved) {
      const rate = parseFloat(saved);
      if (!isNaN(rate) && rate >= 0.5 && rate <= 2.0) {
        setSpeechRate(rate);
      }
    }
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setSpeechRate(newRate);
    localStorage.setItem(SPEECH_RATE_KEY, newRate.toString());
  };

  const testSpeech = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Esta é uma mensagem de teste para verificar a velocidade da fala.');
      utterance.rate = speechRate;
      utterance.lang = 'pt-BR';

      const voices = speechSynthesis.getVoices();
      const portugueseVoice = voices.find(voice => voice.lang.startsWith('pt'));
      if (portugueseVoice) {
        utterance.voice = portugueseVoice;
      }

      speechSynthesis.speak(utterance);
    }
  };

  const toggleVoicesList = () => {
    setShowVoices(!showVoices);
  };

  return <div className="VoiceSettings">
    <div>
      <strong>{(window as any).Lang.settings.speechRate}</strong>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
        <span>{(window as any).Lang.settings.speechRateSlow}</span>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={speechRate}
          onChange={handleRateChange}
          style={{ flex: 1 }}
        />
        <span>{(window as any).Lang.settings.speechRateFast}</span>
        <span style={{ minWidth: '40px', textAlign: 'center' }}>{speechRate.toFixed(1)}x</span>
      </div>
      <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <button
          onClick={testSpeech}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {(window as any).Lang.settings.testSpeech}
        </button>
        <button
          onClick={toggleVoicesList}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showVoices ? (window as any).Lang.settings.hideVoices : (window as any).Lang.settings.listVoices}
        </button>
      </div>
      {showVoices && (
        <div style={{ marginTop: '10px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
          <strong>{(window as any).Lang.settings.availableVoices} ({availableVoices.length}):</strong>
          <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
            {(window as any).Lang.settings.availableLanguages}: {[...new Set(availableVoices.map(v => v.lang))].join(', ')}
          </div>
          <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
            {availableVoices.map((voice, index) => (
              <li key={index} style={{ fontSize: '12px', marginBottom: '2px' }}>
                <strong>{voice.name}</strong> - {voice.lang} 
                {voice.default && <span style={{ color: '#007bff' }}> (padrão)</span>}
                {voice.localService && <span style={{ color: '#28a745' }}> (local)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>;
};

const section: SettingsSection = {
  id: 'voice',
  title: 'Voz e Áudio',
  content: <VoicePreferencesContent />
};

export default section;