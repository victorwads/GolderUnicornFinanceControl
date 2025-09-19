interface AIMicrophoneOnboardingSuccessStepProps {
  titleId: string;
}

export default function AIMicrophoneOnboardingSuccessStep({ titleId }: AIMicrophoneOnboardingSuccessStepProps) {
  return (
    <>
      <h2 id={titleId} className="ai-mic-onboarding__title">{Lang.aiMic.onboarding.success.title}</h2>
      <p className="ai-mic-onboarding__text">{Lang.aiMic.onboarding.success.p1}</p>
    </>
  );
}
