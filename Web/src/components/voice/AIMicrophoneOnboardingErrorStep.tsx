import Button from '@components/ui/Button';

interface AIMicrophoneOnboardingErrorStepProps {
  titleId: string;
  onTryAgain: () => void;
}

export default function AIMicrophoneOnboardingErrorStep({ titleId, onTryAgain }: AIMicrophoneOnboardingErrorStepProps) {
  return (
    <>
      <h2 id={titleId} className="ai-mic-onboarding__title">{Lang.aiMic.onboarding.fail.title}</h2>
      <p className="ai-mic-onboarding__text">{Lang.aiMic.onboarding.fail.p1}</p>
      <div className="ui-dialog__actions ui-dialog__actions--center">
        <Button onClick={onTryAgain} fullWidth>
          {Lang.aiMic.onboarding.actions.tryAgain}
        </Button>
      </div>
    </>
  );
}
