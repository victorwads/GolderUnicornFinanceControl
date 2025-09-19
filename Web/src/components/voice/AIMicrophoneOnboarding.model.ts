import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCssVars } from '@components/Vars';

import {
  AIMicrophoneOnboardingComponentProps,
  AIMicrophoneOnboardingController,
  StartListeningOptions,
  UseOnboardingOptions,
} from './AIMicrophoneOnboarding.types';

const getOnboardingStorageKey = () => `ai-mic-onboarding-${CurrentLang}`;

const hasCompletedOnboarding = () => localStorage.getItem(getOnboardingStorageKey()) === 'true';

export const setCompletedOnboarding = (completed: boolean) => {
  localStorage.setItem(getOnboardingStorageKey(), String(completed));
};

export const useAIMicrophoneOnboarding = ({
  skipOnboarding,
  startNativeListening,
  stopNativeListening,
  resetTranscript,
  onBeginCommandListening,
}: UseOnboardingOptions): AIMicrophoneOnboardingController => {
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
    stopNativeListening();
    resetTranscript();
  }, [hasCompleted, onBeginCommandListening, resetTranscript, skipOnboarding, stopNativeListening]);

  const requestStop = useCallback(() => {
    setIsOpen(false);
    setPendingStart(false);
    setShouldStartAfterClose(false);
    stopNativeListening();
    resetTranscript();
  }, [resetTranscript, stopNativeListening]);

  const handleClose = useCallback(() => {
    const shouldStart = pendingStart && shouldStartAfterClose;

    setIsOpen(false);
    setPendingStart(false);
    setShouldStartAfterClose(false);
    stopNativeListening();
    resetTranscript();

    if (shouldStart) {
      onBeginCommandListening();
    }
  }, [onBeginCommandListening, pendingStart, resetTranscript, shouldStartAfterClose, stopNativeListening]);

  const handleComplete = useCallback(() => {
    setCompletedOnboarding(true);
    setHasCompleted(true);
    setShouldStartAfterClose(true);
  }, []);

  const componentProps = useMemo<AIMicrophoneOnboardingComponentProps>(() => ({
    open: isOpen,
    startNativeListening,
    stopNativeListening,
    resetTranscript,
    onClose: handleClose,
    onComplete: handleComplete,
  }), [handleClose, handleComplete, isOpen, resetTranscript, startNativeListening, stopNativeListening]);

  return {
    requestStart,
    requestStop,
    isActive: isOpen,
    componentProps,
  };
};

export type { StartListeningOptions } from './AIMicrophoneOnboarding.types';
