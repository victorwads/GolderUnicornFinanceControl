import { useAIMicrophoneOnboardingTest } from './AIMicrophoneOnboardingTest.model';

interface AIMicrophoneOnboardingTestStepProps {
  titleId: string;
  transcript: string;
  resetTranscript: () => void;
  onSuccess: () => void;
  onError: () => void;
}

export default function AIMicrophoneOnboardingTestStep({
  titleId,
  transcript,
  resetTranscript,
  onSuccess,
  onError,
}: AIMicrophoneOnboardingTestStepProps) {
  const {
    currentPhraseIndex,
    liveTranscript,
    progressLabel,
    score,
    status,
    testPhrases,
  } = useAIMicrophoneOnboardingTest({
    active: true,
    resetKey: 0,
    transcript,
    resetTranscript,
    onSuccess,
    onError,
  });

  const statusMessages: Record<typeof status, string> = {
    waiting: Lang.aiMic.onboarding.verification.waiting,
    success: Lang.aiMic.onboarding.verification.success,
    retry: Lang.aiMic.onboarding.verification.retry,
  };

  const currentPhrase = testPhrases[currentPhraseIndex] ?? '';
  const hasTranscript = Boolean(liveTranscript);
  const statusLabel = statusMessages[status];

  return (
    <>
      <h2 id={titleId} className="ai-mic-onboarding__title">{Lang.aiMic.onboarding.verification.title}</h2>
      <p className="ai-mic-onboarding__text">{Lang.aiMic.onboarding.verification.instructions}</p>
      <div className="ai-mic-onboarding__progress">{progressLabel}</div>
      <div className="ai-mic-onboarding__card">
        <span className="ai-mic-onboarding__label">{Lang.aiMic.onboarding.verification.targetLabel}</span>
        <p className="ai-mic-onboarding__value">{currentPhrase || '—'}</p>
      </div>
      <div className="ai-mic-onboarding__card ai-mic-onboarding__card--muted">
        <span className="ai-mic-onboarding__label">{Lang.aiMic.onboarding.verification.transcriptLabel}</span>
        <p className="ai-mic-onboarding__value ai-mic-onboarding__value--transcript">{liveTranscript || '—'}</p>
      </div>
      <div className="ai-mic-onboarding__score">
        <span className="ai-mic-onboarding__label">{Lang.aiMic.onboarding.verification.scoreLabel}</span>
        <span className="ai-mic-onboarding__score-value">
          {hasTranscript ? `${score}%` : '—'}
        </span>
      </div>
      <div className={`ai-mic-onboarding__status ai-mic-onboarding__status--${status}`}>
        {statusLabel}
      </div>
    </>
  );
}
