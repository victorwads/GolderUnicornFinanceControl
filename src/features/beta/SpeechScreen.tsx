import './SpeechScreen.css';
import { useEffect, useRef, useState } from 'react';

import { getCurrentLangInfo } from '@lang';

import Icon from '@components/Icons';
import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';

const LAST_CHARS = 80;

const SpeechScreen = () => {
  const [listening, setListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentLangInfo = getCurrentLangInfo();

  useEffect(() => {
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('Seu navegador não suporta reconhecimento de voz.');
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = currentLangInfo.short;
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) setFinalTranscript(prev => prev + final);
      setInterimTranscript(interim);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const text = finalTranscript + interimTranscript;

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const marqueeText = text.slice(-LAST_CHARS);

  return (
    <Container screen spaced className="SpeechScreen">
      <ContainerFixedContent spaced>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={startListening} disabled={listening} className="play-button">
          <Icon icon={Icon.all.faPlay} /> Start
        </button>
        <button onClick={stopListening} disabled={!listening} className="stop-button">
          <Icon icon={Icon.all.faStop} /> Stop
        </button>
        <label>Selected Language: </label>
        <span>{currentLangInfo.short} - {currentLangInfo.name}</span>
        </div>
      </ContainerFixedContent>
      <ContainerScrollContent>
        <textarea ref={textAreaRef} value={text} readOnly className="speech-textarea" />
        {listening && (
          <div className="speech-marquee">
            <span className="speech-marquee-text">{marqueeText}</span>
            <Icon icon={Icon.all.faMicrophone} />
          </div>
        )}
      </ContainerScrollContent>
    </Container>
  );
};

export default SpeechScreen;

