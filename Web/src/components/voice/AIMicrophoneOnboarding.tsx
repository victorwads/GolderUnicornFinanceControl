import { memo } from 'react';

import AIMicrophoneOnboardingInfoStep from './AIMicrophoneOnboardingInfoStep';
import AIMicrophoneOnboardingLanguageStep from './AIMicrophoneOnboardingLanguageStep';
import AIMicrophoneOnboardingPhrasesStep from './AIMicrophoneOnboardingPhrasesStep';
import AIMicrophoneOnboardingResultStep from './AIMicrophoneOnboardingResultStep';
import { OnboardingViewProps } from './AIMicrophoneOnboarding.types';

const AIMicrophoneOnboarding = memo(({ visible, modalTitleId, step, language, verification, onStartTest, onBackToInfo, onConfirmLanguage, onTryAgain, resultStatus }: OnboardingViewProps) => {
  if (!visible) {
    return null;
  }

  let content: JSX.Element | null = null;

  if (step === 'info') {
    content = <AIMicrophoneOnboardingInfoStep titleId={modalTitleId} onStartTest={onStartTest} />;
  } else if (step === 'language') {
    content = (
      <AIMicrophoneOnboardingLanguageStep
        titleId={modalTitleId}
        language={language}
        onBackToInfo={onBackToInfo}
        onConfirmLanguage={onConfirmLanguage}
      />
    );
  } else if (step === 'phrases') {
    content = (
      <AIMicrophoneOnboardingPhrasesStep
        titleId={modalTitleId}
        verification={verification}
      />
    );
  } else if (step === 'success' || step === 'fail') {
    content = (
      <AIMicrophoneOnboardingResultStep
        titleId={modalTitleId}
        status={resultStatus}
        onTryAgain={onTryAgain}
      />
    );
  }

  return (
    <div className="ai-mic-onboarding">
      <div className="ai-mic-onboarding__backdrop" />
      <div className="ai-mic-onboarding__modal" role="dialog" aria-modal="true" aria-labelledby={modalTitleId}>
        {content}
      </div>
    </div>
  );
});

AIMicrophoneOnboarding.displayName = 'AIMicrophoneOnboarding';

export default AIMicrophoneOnboarding;
