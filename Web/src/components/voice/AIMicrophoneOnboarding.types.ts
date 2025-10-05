export type OnboardingStepKey = 'info' | 'language' | 'test' | 'success' | 'error';

export interface StartListeningOptions {
  skipOnboarding?: boolean;
}

export interface UseOnboardingOptions {
  skipOnboarding?: boolean;
  resetTranscript: () => void;
  onBeginCommandListening: () => void;
}

export interface AIMicrophoneOnboardingComponentProps {
  open: boolean;
  resetTranscript: () => void;
  onClose: () => void;
  onComplete: () => void;
}
