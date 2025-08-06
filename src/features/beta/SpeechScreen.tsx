import './SpeechScreen.css';
import { useEffect, useRef, useState } from 'react';

import { getCurrentLangInfo } from '@lang';

import Icon from '@components/Icons';
import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';
import { SpeechRecognitionManager } from './SpeechRecognitionManager';

const SpeechScreen = () => {
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');
  const [marqueeText, setMarqueeText] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const currentLangInfo = getCurrentLangInfo();

  const speechManager = useRef<SpeechRecognitionManager | null>(null);

  useEffect(() => {
    if(!speechManager.current) {
      speechManager.current = new SpeechRecognitionManager(
        currentLangInfo.short,
        (manager, shouldSend) => {
          setText(`
  Current: ${manager.currentSegment}, Send: ${shouldSend}
  Full: ${manager.finalFranscript}
          `);
          setMarqueeText((manager.finalFranscript + manager.currentSegment)); // Atualiza os últimos 80 caracteres
        },
        (request) => {
          console.log('Request to send:', request);
        },
        () => setListening(false)
      );
    }

    return () => {
      speechManager.current?.stop();
    };
  }, [currentLangInfo.short]);

  const startListening = () => {
    if (speechManager.current && !listening) {
      speechManager.current.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (speechManager.current && listening) {
      speechManager.current.stop();
      setListening(false);
    }
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
    }
  }, [text]);

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

