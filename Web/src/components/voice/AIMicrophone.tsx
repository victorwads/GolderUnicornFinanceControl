import './AIMicrophone.css';
import { useSpeechRecognition } from 'react-speech-recognition';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState, ForwardedRef } from 'react';

import { useAIMicrophoneOnboarding } from './AIMicrophoneOnboarding.model';
import AIMicrophoneOnboarding from './AIMicrophoneOnboarding';
import { startListening, stopListening } from './microfone';

import Icon, { Icons } from '@components/Icons';
import AIActionsParser, { AIActionHandler, AIItemData } from '@features/speech/AIParserManager';
import GlassContainer from '@components/GlassContainer';
import { Loading } from '@components/Loading';
import { dispatchAssistantEvent } from '@features/assistant/utils/assistantEvents';

const COMMAND_EVALUATION_DELAY = 3500;

export interface AIMicrophoneProps<T extends AIItemData, A extends string> {
  compact?: boolean;
  withLoading?: boolean;
  parser: AIActionsParser<T, A>;
  disableClick?: boolean;
  onAction?: AIActionHandler<T, A>;
  onPartialResult?: (text: string) => void;
  skipOnboarding?: boolean;
}

interface ProcessingTask { id: number; text: string; startedAt: number; }

export interface AIMicrophoneHandle {
  ensureOnboardingCompleted: () => Promise<boolean>;
}

const AIMicrophone = forwardRef(<T extends AIItemData, A extends string>({
  parser,
  onAction,
  onPartialResult,
  skipOnboarding = false,
  compact = false,
  withLoading = false,
}: AIMicrophoneProps<T, A>,
ref: ForwardedRef<AIMicrophoneHandle>
) => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const recognitionLanguage = CurrentLangInfo.short;

  const sendTimeout = useRef<NodeJS.Timeout | null>(null);
  const [processingQueue, setProcessingQueue] = useState<ProcessingTask[]>([]);
  const taskIdRef = useRef(0);
  const onboardingResolvers = useRef<Array<(success: boolean) => void>>([]);
  const onboardingCompletedRef = useRef(false);

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
      startListening();
    }
    resetTranscript();
  }, [clearSendTimeout, listening, resetTranscript]);

  const {
    isActive: onboardingActive,
    componentProps: onboardingComponentProps,
    requestStart,
    hasCompleted,
  } = useAIMicrophoneOnboarding({
    skipOnboarding,
    resetTranscript,
    onBeginCommandListening: beginCommandListening,
  });

  const resolveOnboarding = useCallback((success: boolean) => {
    const resolvers = onboardingResolvers.current;
    onboardingResolvers.current = [];
    resolvers.forEach((resolve) => {
      try {
        resolve(success);
      } catch (error) {
        console.error('Error resolving microphone onboarding promise', error);
      }
    });
  }, []);

  const originalOnClose = onboardingComponentProps.onClose;
  const originalOnComplete = onboardingComponentProps.onComplete;

  const handleOnboardingClose = useCallback(() => {
    originalOnClose();
    if (!onboardingCompletedRef.current) {
      resolveOnboarding(false);
    }
    onboardingCompletedRef.current = false;
  }, [originalOnClose, resolveOnboarding]);

  const handleOnboardingComplete = useCallback(() => {
    onboardingCompletedRef.current = true;
    originalOnComplete();
    resolveOnboarding(true);
    dispatchAssistantEvent('assistant:micro-onboarding-completed');
  }, [originalOnComplete, resolveOnboarding]);

  const enhancedOnboardingProps = useMemo(() => ({
    ...onboardingComponentProps,
    onClose: handleOnboardingClose,
    onComplete: handleOnboardingComplete,
  }), [handleOnboardingClose, handleOnboardingComplete, onboardingComponentProps]);

  useImperativeHandle(ref, () => ({
    ensureOnboardingCompleted: () => {
      if (hasCompleted) {
        return Promise.resolve(true);
      }

      return new Promise<boolean>((resolve) => {
        onboardingResolvers.current.push(resolve);
        requestStart({ skipOnboarding: false });
      });
    },
  }), [hasCompleted, requestStart]);

  useEffect(() => {
    parser.onAction = (action, changes) => {
      if (action.action === 'stop') {
        // requestStop();
      }
      onAction?.(action, changes);
    };
    return () => {
      parser.onAction = () => {};
    };
  }, [parser, onAction]);

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

  if (!browserSupportsSpeechRecognition) {
    return <span>{Lang.speech.browserNotSupported}</span>;
  }

  useEffect(() => {
    onPartialResult?.(transcript);
  }, [transcript]);

  const placeholder = transcript || (
    listening
      ? (parser.items?.length ? Lang.speech.placeholderListeningHasItems : Lang.speech.placeholderListeningNoItems)
      : ''
  );
  
  return <>
    <GlassContainer className={"speech-marquee" + (compact ? ' compact' : '')}>
      {processingQueue.length > 0 && <div>
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
      </div>}
      <button
        className={`microphone-toggle${listening ? ' listening' : ''}`}
        // onClick={disableClick ? undefined : (() => listening ? stopListening() : requestStart())}
        onClick={(() => listening ? stopListening() : requestStart())}
        aria-label={listening ? Lang.speech.micStop : Lang.speech.micStart}
      >
        {withLoading
          ? <Loading show />
          : <Icon icon={listening ? Icons.faMicrophoneSlash : Icons.faMicrophone} size='sm' />
        }
      </button>
    </GlassContainer>
    <AIMicrophoneOnboarding {...onboardingComponentProps} transcript={transcript} />
  </>;
});

export default AIMicrophone;
