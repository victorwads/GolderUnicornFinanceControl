import './AIMicrophone.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from '@components/Icons';
import { getCurrentLangInfo } from '@lang';
import { getCurrentCosts } from '@resourceUse';
import AIActionsParser, { AIItemWithAction } from '@features/beta/AIParserManager';

const DOLAR_PRICE = 5.5;

export interface AIMicrophoneProps<TAction> {
  parser: AIActionsParser<TAction>;
  onAction: (action: AIItemWithAction<Partial<TAction>>) => void;
}

interface ProcessingTask { id: number; text: string; startedAt: number; }

export default function AIMicrophone<TAction>({ parser, onAction }: AIMicrophoneProps<TAction>) {
  const navigate = useNavigate();
  const currentLangInfo = getCurrentLangInfo();
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const sendTimeout = useRef<NodeJS.Timeout | null>(null);
  const [processingQueue, setProcessingQueue] = useState<ProcessingTask[]>([]);
  const taskIdRef = useRef(0);

  useEffect(() => {
    parser.onAction = onAction;
  }, [parser, onAction]);

  useEffect(() => {
    if (sendTimeout.current) clearTimeout(sendTimeout.current);
    if (!transcript) return;

    sendTimeout.current = setTimeout(async () => {
      const textToProcess = transcript.trim();
      if (!textToProcess) return;

      const id = ++taskIdRef.current;
      const newTask: ProcessingTask = { id, text: textToProcess, startedAt: Date.now() };
      setProcessingQueue(q => [...q, newTask]);

      resetTranscript();
      try {
        await parser.parse(textToProcess, currentLangInfo.short);
      } finally {
        setProcessingQueue(q => q.filter(t => t.id !== id));
      }
    }, 1500);
  }, [transcript, currentLangInfo.short, parser, resetTranscript]);

  useEffect(() => {
    return () => {
      SpeechRecognition.stopListening();
    };
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return <span>{Lang.speech.browserNotSupported}</span>;
  }

  const startListening = () => SpeechRecognition.startListening({
    continuous: true,
    language: currentLangInfo.short,
  });

  const currentCosts = getCurrentCosts();

  const placeholder =
    transcript ||
    (listening
      ? (parser.items?.length ? Lang.speech.placeholderListeningHasItems : Lang.speech.placeholderListeningNoItems)
      : Lang.speech.placeholderNotListening);

  return (
    <div className="speech-marquee glass-container speech-marquee--with-controls">
      <div className="glass-filter"></div>
      <div className="glass-overlay"></div>
      <div className="glass-specular"></div>
      <div className="glass-content glass-content--inline">
        <div className="speech-processing-list">
          {processingQueue.map(task => (
            <div key={task.id} className="speech-processing-item" title={task.text}>
              <span className="loading-spinner loading-spinner--sm" />
              <span className="speech-processing-text">{task.text}</span>
            </div>
          ))}
        </div>
        <button
          className={`microphone-toggle${listening ? ' listening' : ''}`}
          onClick={listening ? SpeechRecognition.stopListening : startListening}
          aria-label={listening ? Lang.speech.micStop : Lang.speech.micStart}
        >
          <Icon icon={listening ? Icon.all.faMicrophoneSlash : Icon.all.faMicrophone} />
        </button>
        <div className="speech-marquee-content">
          <span className="speech-marquee-text">{placeholder}</span>
          <div
            className="speech-marquee-lang"
            title={Lang.speech.changeLangTooltip}
            onClick={() => navigate('/main/settings')}
          >
            <span className="speech-marquee-lang-short">{currentLangInfo.short}</span>
            <span>
              {Lang.speech.tokensUsed(
                currentCosts.tokens,
                (DOLAR_PRICE * currentCosts.dolars).toFixed(4).replace('.', ',')
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
