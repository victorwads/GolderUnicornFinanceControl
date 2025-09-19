import { memo } from 'react';

const AIMicrophoneOnboardingInfoStep = memo(({ titleId, onStartTest }: {
  titleId: string;
  onStartTest: () => void;
}) => (
  <>
    <h2 id={titleId} className="ai-mic-onboarding__title">{Lang.aiMic.onboarding.info.title}</h2>
    <p className="ai-mic-onboarding__text">{Lang.aiMic.onboarding.info.p1}</p>
    <p className="ai-mic-onboarding__text">{Lang.aiMic.onboarding.info.p2}</p>
    <div className="ai-mic-onboarding__actions">
      <button
        type="button"
        className="ai-mic-onboarding__button ai-mic-onboarding__button--primary"
        onClick={onStartTest}
      >
        {Lang.aiMic.onboarding.actions.start}
      </button>
    </div>
  </>
));

AIMicrophoneOnboardingInfoStep.displayName = 'AIMicrophoneOnboardingInfoStep';

export default AIMicrophoneOnboardingInfoStep;
