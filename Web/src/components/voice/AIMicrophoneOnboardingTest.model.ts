import { useCallback, useEffect, useRef, useState } from 'react';

import { startListening, stopListening } from './microfone';

const SCORE_THRESHOLD = 70;
const FAILURE_LIMIT = 5;
const EVALUATION_DELAY = 800;
const SUCCESS_FEEDBACK_DELAY = 1000;
const ONBOARDING_TARGET = 2;

const selectRandomItems = (source: string[], count: number) => {
  const copy = [...source];
  for (let index = copy.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
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

const levenshteinScore = (left: string, right: string) => {
  if (!left.length && !right.length) return 100;

  const matrix = Array.from(
    { length: left.length + 1 },
    () => new Array<number>(right.length + 1).fill(0),
  );

  for (let row = 0; row <= left.length; row++) matrix[row][0] = row;
  for (let column = 0; column <= right.length; column++) matrix[0][column] = column;

  for (let row = 1; row <= left.length; row++) {
    for (let column = 1; column <= right.length; column++) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  const distance = matrix[left.length][right.length];
  const maxLength = Math.max(left.length, right.length) || 1;
  return Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));
};

const computeSimilarityScore = (spoken: string, target: string) => {
  const normalizedSpoken = normalizeSpeechText(spoken);
  const normalizedTarget = normalizeSpeechText(target);
  if (!normalizedSpoken || !normalizedTarget) return 0;
  return levenshteinScore(normalizedSpoken, normalizedTarget);
};

export type VerificationStatus = 'waiting' | 'success' | 'retry';

interface UseAIMicrophoneOnboardingTestOptions {
  active: boolean;
  resetKey: number;
  transcript: string;
  resetTranscript: () => void;
  onSuccess: () => void;
  onError: () => void;
}

export function useAIMicrophoneOnboardingTest({
  active,
  resetKey,
  transcript,
  resetTranscript,
  onSuccess,
  onError,
}: UseAIMicrophoneOnboardingTestOptions) {
  const [phrases, setPhrases] = useState<string[]>(() => selectRandomItems(Lang.aiMic.onboardingCases(), ONBOARDING_TARGET));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<VerificationStatus>('waiting');
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

  const resetSession = useCallback(() => {
    setPhrases(selectRandomItems(Lang.aiMic.onboardingCases(), ONBOARDING_TARGET));
    setCurrentIndex(0);
    setScore(0);
    setStatus('waiting');
    setEvaluatedTranscript('');
    currentIndexRef.current = 0;
    failureCountRef.current = 0;
    previousTranscriptRef.current = '';
    clearEvaluationTimeout();
    clearFeedbackTimeout();
    resetTranscript();
  }, [clearEvaluationTimeout, clearFeedbackTimeout, resetTranscript]);

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

    const nextFailureCount = failureCountRef.current + 1;
    failureCountRef.current = nextFailureCount;

    if (nextFailureCount >= FAILURE_LIMIT) {
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

  const restartListening = useCallback(() => {
    startListening();
  }, []);

  useEffect(() => {
    resetSession();
  }, [resetKey, resetSession]);

  useEffect(() => {
    if (!active) {
      clearEvaluationTimeout();
      clearFeedbackTimeout();
      stopListening();
      resetTranscript();
      previousTranscriptRef.current = '';
      return;
    }

    restartListening();
    resetTranscript();

    return () => {
      clearEvaluationTimeout();
      clearFeedbackTimeout();
      stopListening();
      resetTranscript();
      previousTranscriptRef.current = '';
    };
  }, [active, clearEvaluationTimeout, clearFeedbackTimeout, resetTranscript, restartListening]);

  useEffect(() => {
    if (!active || targetCount !== 0) {
      return;
    }

    onSuccess();
  }, [active, onSuccess, targetCount]);

  useEffect(() => {
    if (!active) {
      return;
    }

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
  }, [active, clearEvaluationTimeout, evaluateTranscript, transcript]);

  const safeCompleted = Math.min(currentIndex, targetCount);
  const safeIndex = targetCount === 0 ? 0 : Math.min(currentIndex, Math.max(0, targetCount - 1));

  return {
    currentPhraseIndex: safeIndex,
    liveTranscript: transcript.trim() || evaluatedTranscript,
    progressLabel: Lang.aiMic.onboarding.progress(safeCompleted, targetCount),
    score,
    status,
    testPhrases: phrases,
    restartListening,
  };
}
