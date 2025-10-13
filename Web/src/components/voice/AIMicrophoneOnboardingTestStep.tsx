import { useCallback, useEffect, useRef, useState } from 'react';
import SpeechRecognition from 'react-speech-recognition';
import { startListening, stopListening } from './microfone';

const SCORE_THRESHOLD = 70;
const FAILURE_LIMIT = 5;
const EVALUATION_DELAY = 800;
const SUCCESS_FEEDBACK_DELAY = 1000;
const ONBOARDING_TARGET = 2;

const selectRandomItems = (source: string[], count: number) => {
  const copy = [...source];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
};

const normalizeSpeechText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const levenshteinScore = (a: string, b: string) => {
  if (!a.length && !b.length) return 100;
  const matrix = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  const distance = matrix[a.length][b.length];
  const maxLength = Math.max(a.length, b.length) || 1;
  return Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));
};

const computeSimilarityScore = (spoken: string, target: string) => {
  const normalizedSpoken = normalizeSpeechText(spoken);
  const normalizedTarget = normalizeSpeechText(target);
  if (!normalizedSpoken || !normalizedTarget) return 0;
  return levenshteinScore(normalizedSpoken, normalizedTarget);
};

interface AIMicrophoneOnboardingTestStepProps {
  titleId: string;
  transcript: string;
  resetTranscript: () => void;
  onSuccess: () => void;
  onError: () => void;
}

export default function AIMicrophoneOnboardingTestStep({
  titleId,
  transcript,
  resetTranscript,
  onSuccess,
  onError,
}: AIMicrophoneOnboardingTestStepProps) {
  const [phrases] = useState(() => selectRandomItems(Lang.aiMic.onboardingCases(), ONBOARDING_TARGET));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'waiting' | 'success' | 'retry'>('waiting');
  const [evaluatedTranscript, setEvaluatedTranscript] = useState('');
  const evaluationTimeout = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeout = useRef<NodeJS.Timeout | null>(null);
  const previousTranscriptRef = useRef('');
  const currentIndexRef = useRef(0);
  const failureCountRef = useRef(0);

  const targetCount = phrases.length;

  const clearEvaluationTimeout = useCallback(() => {
    if (evaluationTimeout.current) {
      clearTimeout(evaluationTimeout.current);
      evaluationTimeout.current = null;
    }
  }, []);

  const clearFeedbackTimeout = useCallback(() => {
    if (feedbackTimeout.current) {
      clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = null;
    }
  }, []);

  const registerSuccess = useCallback(() => {
    setStatus('success');
    failureCountRef.current = 0;

    clearFeedbackTimeout();
    feedbackTimeout.current = setTimeout(() => {
      setStatus('waiting');
      feedbackTimeout.current = null;
    }, SUCCESS_FEEDBACK_DELAY);

    const nextIndex = currentIndexRef.current + 1;
    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);

    if (nextIndex >= phrases.length) {
      onSuccess();
    }
  }, [clearFeedbackTimeout, onSuccess, phrases.length]);

  const registerFailure = useCallback(() => {
    setStatus('retry');
    clearFeedbackTimeout();
    const next = failureCountRef.current + 1;
    failureCountRef.current = next;
    if (next >= FAILURE_LIMIT) {
      onError();
    }
  }, [clearFeedbackTimeout, onError]);

  const evaluateTranscript = useCallback((spoken: string) => {
    const trimmed = spoken.trim();
    const target = phrases[currentIndexRef.current] ?? '';

    if (!trimmed) {
      setEvaluatedTranscript('');
      setScore(0);
      registerFailure();
      resetTranscript();
      previousTranscriptRef.current = '';
      return;
    }

    if (!target) {
      onSuccess();
      resetTranscript();
      previousTranscriptRef.current = '';
      return;
    }

    const similarity = computeSimilarityScore(trimmed, target);
    setScore(similarity);
    setEvaluatedTranscript(trimmed);

    if (similarity >= SCORE_THRESHOLD) {
      registerSuccess();
    } else {
      registerFailure();
    }

    resetTranscript();
    previousTranscriptRef.current = '';
  }, [onSuccess, phrases, registerFailure, registerSuccess, resetTranscript]);

  useEffect(() => {
    startListening();
    resetTranscript();

    return () => {
      clearEvaluationTimeout();
      clearFeedbackTimeout();
      stopListening();
      resetTranscript();
    };
  }, []);

  useEffect(() => {
    if (targetCount === 0) {
      onSuccess();
    }
  }, [onSuccess, targetCount]);

  useEffect(() => {
    const trimmed = transcript.trim();

    if (!trimmed) {
      previousTranscriptRef.current = '';
      clearEvaluationTimeout();
      return;
    }

    if (trimmed === previousTranscriptRef.current) {
      return;
    }

    previousTranscriptRef.current = trimmed;
    clearEvaluationTimeout();

    evaluationTimeout.current = setTimeout(() => {
      evaluationTimeout.current = null;
      evaluateTranscript(trimmed);
    }, EVALUATION_DELAY);

    return () => {
      clearEvaluationTimeout();
    };
  }, [clearEvaluationTimeout, evaluateTranscript, transcript]);

  const safeCompleted = Math.min(currentIndex, targetCount);
  const safeIndex = targetCount === 0 ? 0 : Math.min(currentIndex, Math.max(0, targetCount - 1));
  const currentPhrase = targetCount === 0 ? '' : phrases[safeIndex] ?? '';
  const progressLabel = Lang.aiMic.onboarding.progress(safeCompleted, targetCount);

  const statusMessages: Record<typeof status, string> = {
    waiting: Lang.aiMic.onboarding.verification.waiting,
    success: Lang.aiMic.onboarding.verification.success,
    retry: Lang.aiMic.onboarding.verification.retry,
  };

  const liveTranscript = transcript.trim() || evaluatedTranscript;
  const hasTranscript = Boolean(liveTranscript);
  const statusLabel = statusMessages[status];

  return (
    <>
      <h2 id={titleId} className="ai-mic-onboarding__title">{Lang.aiMic.onboarding.verification.title}</h2>
      <p className="ai-mic-onboarding__text">{Lang.aiMic.onboarding.verification.instructions}</p>
      <div className="ai-mic-onboarding__progress">{progressLabel}</div>
      <div className="ai-mic-onboarding__card">
        <span className="ai-mic-onboarding__label">{Lang.aiMic.onboarding.verification.targetLabel}</span>
        <p className="ai-mic-onboarding__value">{currentPhrase || '—'}</p>
      </div>
      <div className="ai-mic-onboarding__card ai-mic-onboarding__card--muted">
        <span className="ai-mic-onboarding__label">{Lang.aiMic.onboarding.verification.transcriptLabel}</span>
        <p className="ai-mic-onboarding__value ai-mic-onboarding__value--transcript">{liveTranscript || '—'}</p>
      </div>
      <div className="ai-mic-onboarding__score">
        <span className="ai-mic-onboarding__label">{Lang.aiMic.onboarding.verification.scoreLabel}</span>
        <span className="ai-mic-onboarding__score-value">
          {hasTranscript ? `${score}%` : '—'}
        </span>
      </div>
      <div className={`ai-mic-onboarding__status ai-mic-onboarding__status--${status}`}>
        {statusLabel}
      </div>
    </>
  );
}
