import { memo } from 'react';

import { VerificationSectionProps } from './AIMicrophoneOnboarding.types';

const AIMicrophoneOnboardingPhrasesStep = memo(({ titleId, verification }: {
  titleId: string;
  verification: VerificationSectionProps;
}) => {
  const statusMessages: Record<VerificationSectionProps['statusModifier'], string> = {
    waiting: Lang.aiMic.onboarding.verification.waiting,
    success: Lang.aiMic.onboarding.verification.success,
    retry: Lang.aiMic.onboarding.verification.retry,
  };

  const statusLabel = statusMessages[verification.statusModifier] ?? statusMessages.waiting;

  return (
    <>
      <h2 id={titleId} className="ai-mic-onboarding__title">{Lang.aiMic.onboarding.verification.title}</h2>
      <p className="ai-mic-onboarding__text">{Lang.aiMic.onboarding.verification.instructions}</p>
      <div className="ai-mic-onboarding__progress">{verification.progressLabel}</div>
      <div className="ai-mic-onboarding__card">
        <span className="ai-mic-onboarding__label">{Lang.aiMic.onboarding.verification.targetLabel}</span>
        <p className="ai-mic-onboarding__value">{verification.currentPhrase || '—'}</p>
      </div>
      <div className="ai-mic-onboarding__card ai-mic-onboarding__card--muted">
        <span className="ai-mic-onboarding__label">{Lang.aiMic.onboarding.verification.transcriptLabel}</span>
        <p className="ai-mic-onboarding__value ai-mic-onboarding__value--transcript">{verification.transcript || '—'}</p>
      </div>
      <div className="ai-mic-onboarding__score">
        <span className="ai-mic-onboarding__label">{Lang.aiMic.onboarding.verification.scoreLabel}</span>
        <span className="ai-mic-onboarding__score-value">
          {verification.hasTranscript ? `${verification.score}%` : '—'}
        </span>
      </div>
      <div className={`ai-mic-onboarding__status ai-mic-onboarding__status--${verification.statusModifier}`}>
        {statusLabel}
      </div>
    </>
  );
});

AIMicrophoneOnboardingPhrasesStep.displayName = 'AIMicrophoneOnboardingPhrasesStep';

export default AIMicrophoneOnboardingPhrasesStep;
