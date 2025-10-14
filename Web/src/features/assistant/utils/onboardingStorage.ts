import { ProjectStorage } from '@utils/ProjectStorage';

export const ASSISTANT_ONBOARDING_DISMISS_KEY = 'assistant-onboarding-dismissed';

export const isAssistantOnboardingDismissed = (): boolean =>
  ProjectStorage.get(ASSISTANT_ONBOARDING_DISMISS_KEY) === 'true';

export const dismissAssistantOnboarding = (): void => {
  ProjectStorage.set(ASSISTANT_ONBOARDING_DISMISS_KEY, 'true');
};

export const clearAssistantOnboardingDismissal = (): void => {
  ProjectStorage.remove(ASSISTANT_ONBOARDING_DISMISS_KEY);
};
