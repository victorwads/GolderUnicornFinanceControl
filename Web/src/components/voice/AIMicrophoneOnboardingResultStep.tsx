import { memo } from 'react';

const AIMicrophoneOnboardingResultStep = memo(({ titleId, status, onTryAgain }: {
  titleId: string;
  status: 'success' | 'fail';
  onTryAgain: () => void;
}) => (
  <>
    {status === 'success' ? (
      <>
        <h2 id={titleId} className="ai-mic-onboarding__title">{Lang.aiMic.onboarding.success.title}</h2>
        <p className="ai-mic-onboarding__text">{Lang.aiMic.onboarding.success.p1}</p>
      </>
    ) : (
      <>
        <h2 id={titleId} className="ai-mic-onboarding__title">{Lang.aiMic.onboarding.fail.title}</h2>
        <p className="ai-mic-onboarding__text">{Lang.aiMic.onboarding.fail.p1}</p>
        <div className="ai-mic-onboarding__actions">
          <button
            type="button"
            className="ai-mic-onboarding__button ai-mic-onboarding__button--primary"
            onClick={onTryAgain}
          >
            {Lang.aiMic.onboarding.actions.tryAgain}
          </button>
        </div>
      </>
    )}
  </>
));

AIMicrophoneOnboardingResultStep.displayName = 'AIMicrophoneOnboardingResultStep';

export default AIMicrophoneOnboardingResultStep;
