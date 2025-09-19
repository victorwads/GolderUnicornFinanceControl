import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useCssVars } from '@components/Vars';
import { Langs, setLanguage } from '@lang';

import {
  AIMicrophoneOnboardingApi,
  LanguageSectionProps,
  OnboardingStep,
  OnboardingViewProps,
  StartListeningOptions,
  UseOnboardingOptions,
  VerificationSectionProps,
} from './AIMicrophoneOnboarding.types';

const SCORE_THRESHOLD = 70;
const ONBOARDING_TARGET = 4;
const FAILURE_LIMIT = 5;
const EVALUATION_DELAY = 800;
const SUCESS_DISPLAY_TIME = 8000;

const getOnboardingStorageKey = () => `ai-mic-onboarding-${CurrentLang}`;

const hasCompletedOnboarding = () => localStorage.getItem(getOnboardingStorageKey()) === 'true';

export const setCompletedOnboarding = (completed: boolean) => localStorage.setItem(getOnboardingStorageKey(), String(completed));

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

export const useAIMicrophoneOnboarding = ({
  skipOnboarding,
  isListening,
  startNativeListening,
  stopNativeListening,
  resetTranscript,
  onBeginCommandListening,
}: UseOnboardingOptions): AIMicrophoneOnboardingApi => {
  const { lang: currentAppLang } = useCssVars();

  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('idle');
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [onboardingPhrases, setOnboardingPhrases] = useState<string[]>([]);
  const [targetCount, setTargetCount] = useState(ONBOARDING_TARGET);
  const [successfulPhrases, setSuccessfulPhrases] = useState(0);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [liveScore, setLiveScore] = useState(0);
  const [lastEvaluation, setLastEvaluation] = useState<'idle' | 'success' | 'retry'>('idle');
  const [languageSelection, setLanguageSelection] = useState<string>(SavedLang || '');
  const [hasOnboarded, setHasOnboarded] = useState(() => hasCompletedOnboarding());
  const [pendingStartAfterOnboarding, setPendingStartAfterOnboarding] = useState(false);

  const evaluationTimeout = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeout = useRef<NodeJS.Timeout | null>(null);
  const completionTimeout = useRef<NodeJS.Timeout | null>(null);

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

  const clearCompletionTimeout = useCallback(() => {
    if (completionTimeout.current) {
      clearTimeout(completionTimeout.current);
      completionTimeout.current = null;
    }
  }, []);

  const markOnboardingSuccess = useCallback(() => {
    setCompletedOnboarding(true);
    setHasOnboarded(true);
  }, []);

  const openOnboarding = useCallback(() => {
    setOnboardingVisible(true);
    setOnboardingStep('info');
    setOnboardingPhrases([]);
    setTargetCount(ONBOARDING_TARGET);
    setSuccessfulPhrases(0);
    setConsecutiveFailures(0);
    setLiveTranscript('');
    setLiveScore(0);
    setLastEvaluation('idle');
    clearEvaluationTimeout();
    clearFeedbackTimeout();
    clearCompletionTimeout();
    if (isListening) {
      stopNativeListening();
    }
    resetTranscript();
  }, [clearCompletionTimeout, clearEvaluationTimeout, clearFeedbackTimeout, isListening, resetTranscript, stopNativeListening]);

  const startPhraseVerification = useCallback(() => {
    const selected = selectRandomItems(Lang.aiMic.onboardingCases(), ONBOARDING_TARGET);
    if (selected.length === 0) {
      markOnboardingSuccess();
      setOnboardingStep('success');
      return;
    }
    setOnboardingPhrases(selected);
    setTargetCount(selected.length);
    setSuccessfulPhrases(0);
    setConsecutiveFailures(0);
    setLiveTranscript('');
    setLiveScore(0);
    setLastEvaluation('idle');
    setOnboardingStep('phrases');
    clearFeedbackTimeout();
    clearCompletionTimeout();
    clearEvaluationTimeout();
    resetTranscript();
    startNativeListening();
  }, [clearCompletionTimeout, clearEvaluationTimeout, clearFeedbackTimeout, markOnboardingSuccess, resetTranscript, startNativeListening]);

  const incrementFailure = useCallback(() => {
    clearFeedbackTimeout();
    setConsecutiveFailures((previous) => {
      const next = previous + 1;
      if (next >= FAILURE_LIMIT) {
        setOnboardingStep('fail');
      }
      return next;
    });
  }, [clearFeedbackTimeout]);

  const finalizeOnboardingAttempt = useCallback((spoken: string) => {
    const phrase = onboardingPhrases[successfulPhrases] ?? '';
    const score = computeSimilarityScore(spoken, phrase);
    setLiveTranscript(spoken);
    setLiveScore(score);

    if (!spoken.trim()) {
      setLastEvaluation('retry');
      incrementFailure();
      resetTranscript();
      return;
    }

    if (score >= SCORE_THRESHOLD) {
      setLastEvaluation('success');
      setSuccessfulPhrases((previous) => {
        const next = previous + 1;
        if (next >= targetCount) {
          markOnboardingSuccess();
          setOnboardingStep('success');
        }
        return next;
      });
      setConsecutiveFailures(0);
      clearFeedbackTimeout();
      feedbackTimeout.current = setTimeout(() => {
        setLiveTranscript('');
        setLiveScore(0);
        setLastEvaluation('idle');
      }, 1000);
    } else {
      setLastEvaluation('retry');
      incrementFailure();
    }

    resetTranscript();
  }, [clearFeedbackTimeout, incrementFailure, markOnboardingSuccess, onboardingPhrases, resetTranscript, successfulPhrases, targetCount]);

  const handleStartTest = useCallback(() => {
    setConsecutiveFailures(0);
    setSuccessfulPhrases(0);
    setLiveTranscript('');
    setLiveScore(0);
    setLastEvaluation('idle');
    setOnboardingStep('language');
  }, []);

  const handleBackToInfo = useCallback(() => {
    clearEvaluationTimeout();
    clearFeedbackTimeout();
    resetTranscript();
    setOnboardingPhrases([]);
    setSuccessfulPhrases(0);
    setConsecutiveFailures(0);
    setLiveTranscript('');
    setLiveScore(0);
    setLastEvaluation('idle');
    setOnboardingStep('info');
  }, [clearEvaluationTimeout, clearFeedbackTimeout, resetTranscript]);

  const handleLanguageChange = useCallback((value: string) => {
    setLanguageSelection(value);
  }, []);

  const handleTryAgain = useCallback(() => {
    clearEvaluationTimeout();
    clearFeedbackTimeout();
    clearCompletionTimeout();
    resetTranscript();
    setOnboardingPhrases([]);
    setSuccessfulPhrases(0);
    setConsecutiveFailures(0);
    setLiveTranscript('');
    setLiveScore(0);
    setLastEvaluation('idle');
    setOnboardingStep('language');
  }, [clearCompletionTimeout, clearEvaluationTimeout, clearFeedbackTimeout, resetTranscript]);

  const handleConfirmLanguage = useCallback(() => {
    const langKey = languageSelection || undefined;
    setLanguage(langKey as keyof typeof Langs | undefined);
    const completed = hasCompletedOnboarding();
    setHasOnboarded(completed);
    if (completed) {
      setOnboardingStep('success');
      return;
    }
    startPhraseVerification();
  }, [languageSelection, startPhraseVerification]);

  const requestStart = useCallback((options?: StartListeningOptions) => {
    const shouldSkip = options?.skipOnboarding ?? skipOnboarding ?? false;
    if (shouldSkip || hasOnboarded) {
      onBeginCommandListening();
      return;
    }
    setPendingStartAfterOnboarding(true);
    openOnboarding();
  }, [hasOnboarded, onBeginCommandListening, openOnboarding, skipOnboarding]);

  const requestStop = useCallback(() => {
    setPendingStartAfterOnboarding(false);
    setOnboardingVisible(false);
    setOnboardingStep('idle');
    setOnboardingPhrases([]);
    setTargetCount(ONBOARDING_TARGET);
    setSuccessfulPhrases(0);
    setConsecutiveFailures(0);
    setLiveTranscript('');
    setLiveScore(0);
    setLastEvaluation('idle');
    clearEvaluationTimeout();
    clearFeedbackTimeout();
    clearCompletionTimeout();
    feedbackTimeout.current = null;
    completionTimeout.current = null;
    evaluationTimeout.current = null;
    stopNativeListening();
    resetTranscript();
  }, [clearCompletionTimeout, clearEvaluationTimeout, clearFeedbackTimeout, resetTranscript, stopNativeListening]);

  const handleTranscript = useCallback((transcript: string) => {
    if (onboardingStep !== 'phrases') return;
    const trimmed = transcript.trim();
    if (!trimmed) return;

    clearEvaluationTimeout();
    evaluationTimeout.current = setTimeout(() => {
      finalizeOnboardingAttempt(trimmed);
    }, EVALUATION_DELAY);
  }, [clearEvaluationTimeout, finalizeOnboardingAttempt, onboardingStep]);

  useEffect(() => {
    if (onboardingStep !== 'fail') return;
    clearEvaluationTimeout();
    clearFeedbackTimeout();
    clearCompletionTimeout();
    stopNativeListening();
    resetTranscript();
  }, [onboardingStep, clearCompletionTimeout, clearEvaluationTimeout, clearFeedbackTimeout, resetTranscript, stopNativeListening]);

  useEffect(() => {
    if (onboardingStep !== 'success') return;

    stopNativeListening();
    resetTranscript();
    clearEvaluationTimeout();
    clearFeedbackTimeout();
    clearCompletionTimeout();

    completionTimeout.current = setTimeout(() => {
      if (pendingStartAfterOnboarding) {
        setPendingStartAfterOnboarding(false);
        setOnboardingVisible(false);
        setOnboardingStep('idle');
        onBeginCommandListening();
      } else {
        setOnboardingVisible(false);
        setOnboardingStep('idle');
      }
    }, SUCESS_DISPLAY_TIME);

    return () => {
      clearCompletionTimeout();
    };
  }, [onboardingStep, clearCompletionTimeout, clearEvaluationTimeout, clearFeedbackTimeout, onBeginCommandListening, pendingStartAfterOnboarding, resetTranscript, stopNativeListening]);

  useEffect(() => {
    if (!onboardingVisible || onboardingStep === 'phrases') return;
    stopNativeListening();
    resetTranscript();
  }, [onboardingVisible, onboardingStep, resetTranscript, stopNativeListening]);

  useEffect(() => {
    setLanguageSelection(SavedLang || '');
    setHasOnboarded(hasCompletedOnboarding());
  }, [currentAppLang]);

  useEffect(() => {
    return () => {
      clearEvaluationTimeout();
      clearFeedbackTimeout();
      clearCompletionTimeout();
      stopNativeListening();
    };
  }, [clearCompletionTimeout, clearEvaluationTimeout, clearFeedbackTimeout, stopNativeListening]);

  const modalTitleId = useMemo(
    () => `ai-mic-onboarding-title-${Math.random().toString(36).slice(2)}`,
    [],
  );

  const languageOptions = useMemo(
    () => [
      { value: '', label: `${Lang.commons.default} (${navigator.language})` },
      ...Object.entries(Langs).map(([value, info]) => ({ value, label: info.name })),
    ],
    [currentAppLang],
  );

  const resolvedLanguageInfo = useMemo(() => {
    const key = (languageSelection || CurrentLang) as keyof typeof Langs;
    return Langs[key] ?? Langs['en'];
  }, [languageSelection, currentAppLang]);

  const statusModifier = lastEvaluation === 'idle' ? 'waiting' : lastEvaluation;
  const currentPhrase = onboardingPhrases[Math.min(successfulPhrases, onboardingPhrases.length - 1)] || onboardingPhrases[successfulPhrases] || '';
  const progressLabel = Lang.aiMic.onboarding.progress(successfulPhrases, targetCount);

  const languageSection: LanguageSectionProps = useMemo(() => ({
    options: languageOptions,
    selection: languageSelection,
    onChange: handleLanguageChange,
    displayName: resolvedLanguageInfo.name,
    code: CurrentLangInfo.short,
  }), [handleLanguageChange, languageOptions, languageSelection, resolvedLanguageInfo]);

  const verificationSection: VerificationSectionProps = useMemo(() => ({
    progressLabel,
    currentPhrase,
    transcript: liveTranscript,
    score: liveScore,
    statusModifier,
    hasTranscript: Boolean(liveTranscript),
  }), [currentPhrase, liveScore, liveTranscript, progressLabel, statusModifier]);

  const resultStatus: 'success' | 'fail' = onboardingStep === 'fail' ? 'fail' : 'success';

  const viewProps: OnboardingViewProps = useMemo(() => ({
    visible: onboardingVisible,
    modalTitleId,
    step: onboardingStep,
    language: languageSection,
    verification: verificationSection,
    onStartTest: handleStartTest,
    onBackToInfo: handleBackToInfo,
    onConfirmLanguage: handleConfirmLanguage,
    onTryAgain: handleTryAgain,
    onClose: requestStop,
    resultStatus,
  }), [
    handleBackToInfo,
    handleConfirmLanguage,
    handleStartTest,
    handleTryAgain,
    languageSection,
    modalTitleId,
    onboardingStep,
    onboardingVisible,
    requestStop,
    resultStatus,
    verificationSection,
  ]);

  return {
    requestStart,
    requestStop,
    isActive: onboardingVisible,
    handleTranscript,
    viewProps,
  };
};


export type { StartListeningOptions } from './AIMicrophoneOnboarding.types';
