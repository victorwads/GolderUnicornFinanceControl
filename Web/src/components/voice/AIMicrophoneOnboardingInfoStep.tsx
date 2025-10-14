import Button from '@components/ui/Button';

interface AIMicrophoneOnboardingInfoStepProps {
  titleId: string;
  onNext: () => void;
}

export default function AIMicrophoneOnboardingInfoStep({ titleId, onNext }: AIMicrophoneOnboardingInfoStepProps) {
  return (
    <>
      <h2 id={titleId} className="ai-mic-onboarding__title">{Lang.aiMic.onboarding.info.title}</h2>
      <p className="ai-mic-onboarding__text">{Lang.aiMic.onboarding.info.p1}</p>
      <p className="ai-mic-onboarding__text">{Lang.aiMic.onboarding.info.p2}</p>
      <div className="ui-dialog__actions ui-dialog__actions--center">
        <Button onClick={onNext} fullWidth>
          {Lang.aiMic.onboarding.actions.start}
        </Button>
      </div>
    </>
  );
}
