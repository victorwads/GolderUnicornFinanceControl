import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCssVars } from '@components/Vars';

import {
  AIMicrophoneOnboardingComponentProps,
  StartListeningOptions,
  UseOnboardingOptions,
} from './AIMicrophoneOnboarding.types';
import { stopListening } from './microfone';

const getOnboardingStorageKey = () => `ai-mic-onboarding-${CurrentLang}`;

const hasCompletedOnboarding = () => localStorage.getItem(getOnboardingStorageKey()) === 'true';

export const setCompletedOnboarding = (completed: boolean) => {
  localStorage.setItem(getOnboardingStorageKey(), String(completed));
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
  };
};

export type { StartListeningOptions } from './AIMicrophoneOnboarding.types';
