export const ASSISTANT_ONBOARDING_DISMISS_KEY = 'assistant-onboarding-dismissed';

export const isAssistantOnboardingDismissed = (): boolean =>
  localStorage.getItem(ASSISTANT_ONBOARDING_DISMISS_KEY) === 'true';

export const dismissAssistantOnboarding = (): void => {
  localStorage.setItem(ASSISTANT_ONBOARDING_DISMISS_KEY, 'true');
};

export const clearAssistantOnboardingDismissal = (): void => {
  localStorage.removeItem(ASSISTANT_ONBOARDING_DISMISS_KEY);
};
