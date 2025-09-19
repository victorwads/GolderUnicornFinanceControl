import './AIMicrophone.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from '@components/Icons';
import AIActionsParser, { AIActionHandler, AIItemData } from '@features/speech/AIParserManager';
import AIMicrophoneOnboarding from './AIMicrophoneOnboarding';
import { StartListeningOptions, useAIMicrophoneOnboarding } from './AIMicrophoneOnboarding.model';

const COMMAND_EVALUATION_DELAY = 3000;

export interface AIMicrophoneProps<T extends AIItemData, A extends string> {
  parser: AIActionsParser<T, A>;
  onAction?: AIActionHandler<T, A>;
  skipOnboarding?: boolean;
}

interface ProcessingTask { id: number; text: string; startedAt: number; }

interface ControlHandlers {
  start: (options?: StartListeningOptions) => void;
  stop: () => void;
}

const startSpeechRecognition = () => SpeechRecognition.startListening({
  continuous: true,
  language: CurrentLangInfo.short,
});

const stopSpeechRecognition = () => {
  console.log('Stopping listening');
  setTimeout(() => SpeechRecognition.stopListening(), 100);
};

let activeHandlers: ControlHandlers | null = null;

export const startListening = (options?: StartListeningOptions) => {
  if (activeHandlers) {
    activeHandlers.start(options);
    return;
  }
  startSpeechRecognition();
};

export const stopListening = () => {
  if (activeHandlers) {
    activeHandlers.stop();
    return;
  }
  stopSpeechRecognition();
};

export default function AIMicrophone<T extends AIItemData, A extends string>({
  parser,
  onAction,
  skipOnboarding = false,
}: AIMicrophoneProps<T, A>) {
  const navigate = useNavigate();
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const recognitionLanguage = CurrentLangInfo.short;

  const sendTimeout = useRef<NodeJS.Timeout | null>(null);
  const [processingQueue, setProcessingQueue] = useState<ProcessingTask[]>([]);
  const taskIdRef = useRef(0);

  const clearSendTimeout = useCallback(() => {
    if (sendTimeout.current) {
      clearTimeout(sendTimeout.current);
      sendTimeout.current = null;
    }
  }, []);

  const beginCommandListening = useCallback(() => {
    clearSendTimeout();
    setProcessingQueue([]);
    if (!listening) {
      startSpeechRecognition();
    }
    resetTranscript();
  }, [clearSendTimeout, listening, resetTranscript]);

  const {
    requestStart: requestStartWithOnboarding,
    requestStop: requestStopWithOnboarding,
    isActive: onboardingActive,
    componentProps: onboardingComponentProps,
  } = useAIMicrophoneOnboarding({
    skipOnboarding,
    startNativeListening: startSpeechRecognition,
    stopNativeListening: stopSpeechRecognition,
    resetTranscript,
    onBeginCommandListening: beginCommandListening,
  });

  const requestStart = useCallback((options?: StartListeningOptions) => {
    if (listening) return;
    requestStartWithOnboarding(options);
  }, [listening, requestStartWithOnboarding]);

  const requestStop = useCallback(() => {
    requestStopWithOnboarding();
    setProcessingQueue([]);
    clearSendTimeout();
    stopSpeechRecognition();
    resetTranscript();
  }, [clearSendTimeout, requestStopWithOnboarding, resetTranscript]);

  useEffect(() => {
    parser.onAction = (action, changes) => {
      if (action.action === 'stop') {
        requestStop();
      }
      onAction?.(action, changes);
    };
    return () => {
      parser.onAction = () => {};
    };
  }, [parser, onAction, requestStop]);

  useEffect(() => {
    clearSendTimeout();

    const trimmedTranscript = transcript.trim();
    if (!trimmedTranscript) {
      return;
    }

    if (onboardingActive) {
      clearSendTimeout();
      return () => {
        clearSendTimeout();
      };
    }

    sendTimeout.current = setTimeout(async () => {
      const textToProcess = trimmedTranscript;
      if (!textToProcess) return;

      const id = ++taskIdRef.current;
      const newTask: ProcessingTask = { id, text: textToProcess, startedAt: Date.now() };
      setProcessingQueue((queue) => [...queue, newTask]);

      resetTranscript();
      try {
        await parser.parse(textToProcess, recognitionLanguage);
      } finally {
        setProcessingQueue((queue) => queue.filter((task) => task.id !== id));
      }
    }, COMMAND_EVALUATION_DELAY);

    return () => {
      clearSendTimeout();
    };
  }, [transcript, onboardingActive, parser, recognitionLanguage, resetTranscript, clearSendTimeout]);

  useEffect(() => {
    const handlers: ControlHandlers = {
      start: requestStart,
      stop: requestStop,
    };
    activeHandlers = handlers;
    return () => {
      if (activeHandlers === handlers) {
        activeHandlers = null;
      }
    };
  }, [requestStart, requestStop]);

  useEffect(() => {
    return () => {
      clearSendTimeout();
      stopSpeechRecognition();
    };
  }, [clearSendTimeout]);

  if (!browserSupportsSpeechRecognition) {
    return <span>{Lang.speech.browserNotSupported}</span>;
  }

  const placeholder = transcript || (
    listening
      ? (parser.items?.length ? Lang.speech.placeholderListeningHasItems : Lang.speech.placeholderListeningNoItems)
      : ''
  );

  return (
    <>
      <div className="speech-marquee glass-container speech-marquee--with-controls">
        <div className="glass-filter"></div>
        <div className="glass-overlay"></div>
        <div className="glass-specular"></div>
        <div className="glass-content glass-content--inline">
          {!listening && (
            <div
              className="speech-marquee-lang"
              title={Lang.speech.changeLangTooltip}
              onClick={() => navigate('/main/settings')}
            >
              <span className="speech-marquee-lang-short">{CurrentLangInfo.short}</span>
            </div>
          )}
          <div>
            {listening && (
              <div className="speech-marquee-content">
                <span className="speech-marquee-text">{placeholder}</span>
              </div>
            )}
            <div className="speech-processing-list">
              {processingQueue.map(task => (
                <div key={task.id} className="speech-processing-item" title={task.text}>
                  <span className="loading-spinner loading-spinner--sm" />
                  <span className="speech-processing-text">{task.text}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className={`microphone-toggle${listening ? ' listening' : ''}`}
            onClick={listening ? requestStop : () => requestStart()}
            aria-label={listening ? Lang.speech.micStop : Lang.speech.micStart}
          >
            <Icon icon={listening ? Icon.all.faMicrophoneSlash : Icon.all.faMicrophone} />
          </button>
        </div>
      </div>

      <AIMicrophoneOnboarding {...onboardingComponentProps} transcript={transcript} />
    </>
  );
}
