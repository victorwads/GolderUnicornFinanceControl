export type OnboardingStep = 'idle' | 'info' | 'language' | 'phrases' | 'success' | 'fail';

export interface StartListeningOptions {
  skipOnboarding?: boolean;
}

export interface LanguageOption {
  value: string;
  label: string;
}

export interface LanguageSectionProps {
  options: LanguageOption[];
  selection: string;
  onChange: (value: string) => void;
  displayName: string;
  code: string;
}

export interface VerificationSectionProps {
  progressLabel: string;
  currentPhrase: string;
  transcript: string;
  score: number;
  statusModifier: 'waiting' | 'success' | 'retry';
  hasTranscript: boolean;
}

export interface OnboardingViewProps {
  visible: boolean;
  modalTitleId: string;
  step: OnboardingStep;
  language: LanguageSectionProps;
  verification: VerificationSectionProps;
  onStartTest: () => void;
  onBackToInfo: () => void;
  onConfirmLanguage: () => void;
  onTryAgain: () => void;
  onClose: () => void;
  resultStatus: 'success' | 'fail';
}

export interface UseOnboardingOptions {
  skipOnboarding?: boolean;
  isListening: boolean;
  startNativeListening: () => void;
  stopNativeListening: () => void;
  resetTranscript: () => void;
  onBeginCommandListening: () => void;
}

export interface AIMicrophoneOnboardingApi {
  requestStart: (options?: StartListeningOptions) => void;
  requestStop: () => void;
  isActive: boolean;
  handleTranscript: (transcript: string) => void;
  viewProps: OnboardingViewProps;
}
