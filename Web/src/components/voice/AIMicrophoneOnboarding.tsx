import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Langs, setLanguage } from '@lang';
import AudioOnboarding, { ToHomeRoute } from '@layouts/onboarding/AudioOnboarding';

import { useAIMicrophoneOnboardingTest } from './AIMicrophoneOnboardingTest.model';
import { AIMicrophoneOnboardingComponentProps, OnboardingStepKey } from './AIMicrophoneOnboarding.types';

const SUCCESS_DISPLAY_TIME = 8000;
const DEFAULT_LANGUAGE_OPTION_VALUE = '__default__';

interface AIMicrophoneOnboardingProps extends AIMicrophoneOnboardingComponentProps {
  transcript: string;
  listening: boolean;
}

export default function AIMicrophoneOnboarding({
  open,
  transcript,
  listening,
  resetTranscript,
  onClose,
  onComplete,
}: AIMicrophoneOnboardingProps) {
  const [step, setStep] = useState<OnboardingStepKey>('info');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(SavedLang || DEFAULT_LANGUAGE_OPTION_VALUE);
  const [testResetKey, setTestResetKey] = useState(0);
  const successTimeout = useRef<NodeJS.Timeout | null>(null);

  const clearSuccessTimeout = useCallback(() => {
    if (successTimeout.current) {
      clearTimeout(successTimeout.current);
      successTimeout.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    clearSuccessTimeout();
    onClose();
  }, [clearSuccessTimeout, onClose]);

  const handleNavigate = useCallback((route: unknown) => {
    if (route instanceof ToHomeRoute) {
      handleClose();
    }
  }, [handleClose]);

  const goToStep = useCallback((nextStep: OnboardingStepKey) => {
    clearSuccessTimeout();
    setStep(nextStep);
  }, [clearSuccessTimeout]);

  const handleInfoNext = useCallback(() => {
    goToStep('language');
  }, [goToStep]);

  const handleLanguageNext = useCallback(() => {
    const languageToApply = selectedLanguage === DEFAULT_LANGUAGE_OPTION_VALUE ? undefined : selectedLanguage;
    setLanguage(languageToApply as keyof typeof Langs | undefined);
    resetTranscript();
    setTestResetKey((current) => current + 1);
    goToStep('test');
  }, [goToStep, resetTranscript, selectedLanguage]);

  const handleTestSuccess = useCallback(() => {
    onComplete();
    goToStep('success');
  }, [goToStep, onComplete]);

  const handleTestError = useCallback(() => {
    goToStep('error');
  }, [goToStep]);

  const handleTryAgain = useCallback(() => {
    resetTranscript();
    setTestResetKey((current) => current + 1);
    goToStep('test');
  }, [goToStep, resetTranscript]);

  const {
    currentPhraseIndex,
    liveTranscript,
    progressLabel,
    score,
    status,
    testPhrases,
    restartListening,
  } = useAIMicrophoneOnboardingTest({
    active: open && step === 'test',
    resetKey: testResetKey,
    transcript,
    resetTranscript,
    onSuccess: handleTestSuccess,
    onError: handleTestError,
  });

  const languageOptions = useMemo(
    () => [
      { value: DEFAULT_LANGUAGE_OPTION_VALUE, label: `${Lang.commons.default} (${navigator.language})` },
      ...Object.entries(Langs).map(([value, info]) => ({
        value,
        label: info.name,
      })),
    ],
    [],
  );

  const currentLanguageSummary = useMemo(() => {
    const hasCustomSelection = selectedLanguage !== DEFAULT_LANGUAGE_OPTION_VALUE;
    const previewInfo = hasCustomSelection
      ? Langs[selectedLanguage as keyof typeof Langs] ?? Langs.en
      : Langs[CurrentLang] ?? Langs.en;
    const previewCode = hasCustomSelection ? previewInfo.short : CurrentLangInfo.short;
    return `${previewInfo.name} ${previewCode}`;
  }, [selectedLanguage]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setStep('info');
    setSelectedLanguage(SavedLang || DEFAULT_LANGUAGE_OPTION_VALUE);
    setTestResetKey((current) => current + 1);
    resetTranscript();
  }, [open, resetTranscript]);

  useEffect(() => {
    if (!open || step !== 'success') {
      clearSuccessTimeout();
      return;
    }

    successTimeout.current = setTimeout(() => {
      handleClose();
    }, SUCCESS_DISPLAY_TIME);

    return () => {
      clearSuccessTimeout();
    };
  }, [clearSuccessTimeout, handleClose, open, step]);

  useEffect(() => () => clearSuccessTimeout(), [clearSuccessTimeout]);

  if (!open) {
    return null;
  }

  return (
    <div className="ai-mic-onboarding">
      <div className="ai-mic-onboarding__backdrop" />
      <div className="ai-mic-onboarding__modal-shell" role="dialog" aria-modal="true" aria-label={Lang.aiMic.onboarding.info.title}>
        <AudioOnboarding
          model={{
            navigate: handleNavigate,
            step: step === 'info' ? 0 : step === 'language' ? 1 : step === 'test' ? 2 : step === 'success' ? 4 : 5,
            selectedLanguage,
            setSelectedLanguage,
            languageOptions,
            currentLanguageSummary,
            currentPhraseIndex,
            isListening: listening,
            transcription: liveTranscript,
            score,
            progressLabel,
            status,
            handleStartTest: handleInfoNext,
            handleConfirmLanguage: handleLanguageNext,
            handleSkipTest: () => {
              onComplete();
              handleClose();
            },
            simulateListening: restartListening,
            handleComplete: handleClose,
            handleTryAgain,
            testPhrases,
          }}
        />
      </div>
    </div>
  );
}
