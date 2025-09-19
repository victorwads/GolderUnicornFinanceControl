export type OnboardingStepKey = 'info' | 'language' | 'test' | 'success' | 'error';

export interface StartListeningOptions {
  skipOnboarding?: boolean;
}

export interface UseOnboardingOptions {
  skipOnboarding?: boolean;
  startNativeListening: () => void;
  stopNativeListening: () => void;
  resetTranscript: () => void;
  onBeginCommandListening: () => void;
}

export interface AIMicrophoneOnboardingComponentProps {
  open: boolean;
  startNativeListening: () => void;
  stopNativeListening: () => void;
  resetTranscript: () => void;
  onClose: () => void;
  onComplete: () => void;
}

export interface AIMicrophoneOnboardingController {
  requestStart: (options?: StartListeningOptions) => void;
  requestStop: () => void;
  isActive: boolean;
  componentProps: AIMicrophoneOnboardingComponentProps;
}
