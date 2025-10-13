import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCssVars } from '@components/Vars';
import { Langs } from '@lang';
import { subscribeAssistantEvent } from '@features/assistant/utils/assistantEvents';

import {
  AIMicrophoneOnboardingComponentProps,
  StartListeningOptions,
  UseOnboardingOptions,
} from './AIMicrophoneOnboarding.types';
import { stopListening } from './microfone';

export const AI_MIC_ONBOARDING_STORAGE_PREFIX = 'ai-mic-onboarding-';

const getOnboardingStorageKey = () => `${AI_MIC_ONBOARDING_STORAGE_PREFIX}${CurrentLang}`;

const hasCompletedOnboarding = () => localStorage.getItem(getOnboardingStorageKey()) === 'true';

export const hasCompletedAIMicrophoneOnboarding = () => hasCompletedOnboarding();

export const setCompletedOnboarding = (completed: boolean) => {
  localStorage.setItem(getOnboardingStorageKey(), String(completed));
};

export const clearAIMicrophoneOnboardingFlags = () => {
  Object.keys(Langs).forEach((lang) => {
    localStorage.removeItem(`${AI_MIC_ONBOARDING_STORAGE_PREFIX}${lang}`);
  });
};

export const useAIMicrophoneOnboarding = ({
  skipOnboarding,
  resetTranscript,
  onBeginCommandListening,
}: UseOnboardingOptions) => {
  let currentCssLang: string | null = null;
  try {
    currentCssLang = useCssVars().lang;
  } catch (error) {
    currentCssLang = null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(() => hasCompletedOnboarding());
  const [pendingStart, setPendingStart] = useState(false);
  const [shouldStartAfterClose, setShouldStartAfterClose] = useState(false);

  useEffect(() => {
    setHasCompleted(hasCompletedOnboarding());
  }, [currentCssLang]);

  useEffect(() => {
    return subscribeAssistantEvent('assistant:onboarding-reset', () => {
      setHasCompleted(hasCompletedOnboarding());
    });
  }, []);

  const requestStart = useCallback((options?: StartListeningOptions) => {
    const shouldSkip = options?.skipOnboarding ?? skipOnboarding ?? false;
    if (shouldSkip || hasCompleted) {
      onBeginCommandListening();
      return;
    }

    setPendingStart(true);
    setShouldStartAfterClose(false);
    setIsOpen(true);
    resetTranscript();
  }, [hasCompleted, onBeginCommandListening, resetTranscript, skipOnboarding]);

  const handleClose = useCallback(() => {
    const shouldStart = pendingStart && shouldStartAfterClose;

    setIsOpen(false);
    setPendingStart(false);
    setShouldStartAfterClose(false);
    stopListening();
    resetTranscript();

    if (shouldStart) {
      onBeginCommandListening();
    }
  }, [onBeginCommandListening, pendingStart, resetTranscript, shouldStartAfterClose]);

  const handleComplete = useCallback(() => {
    setCompletedOnboarding(true);
    setHasCompleted(true);
    setShouldStartAfterClose(true);
  }, []);

  const componentProps = useMemo<AIMicrophoneOnboardingComponentProps>(() => ({
    open: isOpen,
    resetTranscript,
    onClose: handleClose,
    onComplete: handleComplete,
  }), [handleClose, handleComplete, isOpen, resetTranscript]);

  return {
    requestStart,
    isActive: isOpen,
    componentProps,
    hasCompleted,
  };
};

export type { StartListeningOptions } from './AIMicrophoneOnboarding.types';
