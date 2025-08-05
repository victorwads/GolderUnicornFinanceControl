import { useEffect, useRef, useState } from 'react';
import Icon from '@components/Icons';
import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';
import './SpeechScreen.css';

const LAST_CHARS = 100;

const SpeechScreen = () => {
  const [listening, setListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pt-BR';
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
      <ContainerFixedContent>
        <button onClick={startListening} disabled={listening} className="play-button">
          <Icon icon={Icon.all.faPlay} />
        </button>
      </ContainerFixedContent>
      <ContainerScrollContent>
        <textarea ref={textAreaRef} value={text} readOnly className="speech-textarea" />
      </ContainerScrollContent>
      <div className="speech-marquee">
        <span className="speech-marquee-text">{marqueeText}</span>
        <Icon icon={Icon.all.faMicrophone} />
      </div>
    </Container>
  );
};

export default SpeechScreen;

