import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AIMicrophoneOnboardingErrorStep from './AIMicrophoneOnboardingErrorStep';
import AIMicrophoneOnboardingInfoStep from './AIMicrophoneOnboardingInfoStep';
import AIMicrophoneOnboardingLanguageStep from './AIMicrophoneOnboardingLanguageStep';
import AIMicrophoneOnboardingSuccessStep from './AIMicrophoneOnboardingSuccessStep';
import AIMicrophoneOnboardingTestStep from './AIMicrophoneOnboardingTestStep';
import { AIMicrophoneOnboardingComponentProps, OnboardingStepKey } from './AIMicrophoneOnboarding.types';

const SUCCESS_DISPLAY_TIME = 8000;

interface AIMicrophoneOnboardingProps extends AIMicrophoneOnboardingComponentProps {
  transcript: string;
}

export default function AIMicrophoneOnboarding({
  open,
  transcript,
  resetTranscript,
  onClose,
  onComplete,
}: AIMicrophoneOnboardingProps) {
  const [step, setStep] = useState<OnboardingStepKey>('info');
  const successTimeout = useRef<NodeJS.Timeout | null>(null);

  const modalTitleId = useMemo(
    () => `ai-mic-onboarding-title-${Math.random().toString(36).slice(2)}`,
    [],
  );

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

  const goToStep = useCallback((nextStep: OnboardingStepKey) => {
    clearSuccessTimeout();
    setStep(nextStep);
  }, [clearSuccessTimeout]);

  const handleInfoNext = useCallback(() => {
    goToStep('language');
  }, [goToStep]);

  const handleLanguageBack = useCallback(() => {
    goToStep('info');
  }, [goToStep]);

  const handleLanguageNext = useCallback(() => {
    resetTranscript();
    goToStep('test');
  }, [goToStep, resetTranscript]);

  const handleTestSuccess = useCallback(() => {
    onComplete();
    goToStep('success');
  }, [goToStep, onComplete]);

  const handleTestError = useCallback(() => {
    goToStep('error');
  }, [goToStep]);

  const handleTryAgain = useCallback(() => {
    resetTranscript();
    goToStep('language');
  }, [goToStep, resetTranscript]);

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

  let content: JSX.Element | null = null;

  if (step === 'info') {
    content = (
      <AIMicrophoneOnboardingInfoStep
        titleId={modalTitleId}
        onNext={handleInfoNext}
      />
    );
  } else if (step === 'language') {
    content = (
      <AIMicrophoneOnboardingLanguageStep
        titleId={modalTitleId}
        onBack={handleLanguageBack}
        onNext={handleLanguageNext}
      />
    );
  } else if (step === 'test') {
    content = (
      <AIMicrophoneOnboardingTestStep
        titleId={modalTitleId}
        transcript={transcript}
        resetTranscript={resetTranscript}
        onSuccess={handleTestSuccess}
        onError={handleTestError}
      />
    );
  } else if (step === 'success') {
    content = (
      <AIMicrophoneOnboardingSuccessStep
        titleId={modalTitleId}
      />
    );
  } else if (step === 'error') {
    content = (
      <AIMicrophoneOnboardingErrorStep
        titleId={modalTitleId}
        onTryAgain={handleTryAgain}
      />
    );
  }

  return (
    <div className="ai-mic-onboarding">
      <div className="ai-mic-onboarding__backdrop" />
      <div className="ai-mic-onboarding__modal" role="dialog" aria-modal="true" aria-labelledby={modalTitleId}>
        <div className='ai-mic-onboarding__header'>
        <button type="button" onClick={onComplete} >
          {Lang.aiMic.onboarding.actions.imDone}
        </button>
        <button type="button" onClick={handleClose} >
          {Lang.aiMic.onboarding.actions.close}
        </button>
        </div>
        {content}
      </div>
    </div>
  );
}
