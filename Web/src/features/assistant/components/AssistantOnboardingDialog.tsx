import './AssistantOnboardingDialog.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import getRepositories, { User } from '@repositories';
import { hasCompletedAIMicrophoneOnboarding } from '@componentsDeprecated/voice/AIMicrophoneOnboarding.model';
import {
  dismissAssistantOnboarding,
  isAssistantOnboardingDismissed,
} from '../utils/onboardingStorage';
import {
  dispatchAssistantEvent,
  subscribeAssistantEvent,
} from '../utils/assistantEvents';

const evaluateVisibility = (user: User | null, skipSession: boolean) => {
  if (!user) return false;
  if (user.onboardingDone) return false;
  if (skipSession) return false;
  return !isAssistantOnboardingDismissed();
};

const AssistantOnboardingDialog = () => {
  const userRepo = useRef(getRepositories().user);
  const userRef = useRef<User | null>(null);
  const [visible, setVisible] = useState(false);
  const [skipSession, setSkipSession] = useState(false);
  const [microOnboardingCompleted, setMicroOnboardingCompleted] = useState(() => hasCompletedAIMicrophoneOnboarding());
  const syncingRef = useRef(false);

  const refreshVisibility = useCallback(() => {
    setVisible(evaluateVisibility(userRef.current, skipSession));
  }, [skipSession]);

  const syncUser = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      const data = await userRepo.current.getUserData();
      userRef.current = data;
      refreshVisibility();
    } catch (error) {
      console.error('Failed to load user onboarding data', error);
    } finally {
      syncingRef.current = false;
    }
  }, [refreshVisibility]);

  useEffect(() => {
    syncUser();
    return userRepo.current.addUpdatedEventListenner(() => {
      syncUser();
    });
  }, [syncUser]);

  useEffect(() => {
    refreshVisibility();
  }, [skipSession, refreshVisibility]);

  useEffect(() => {
    return subscribeAssistantEvent('assistant:onboarding-reset', () => {
      setSkipSession(false);
      setMicroOnboardingCompleted(hasCompletedAIMicrophoneOnboarding());
      syncUser();
    });
  }, [syncUser]);

  useEffect(() => {
    return subscribeAssistantEvent('assistant:micro-onboarding-completed', () => {
      setMicroOnboardingCompleted(true);
    });
  }, []);

  const handleStart = useCallback(() => {
    setSkipSession(true);
    setVisible(false);
    dispatchAssistantEvent('assistant:start-onboarding');
  }, []);

  const handleDismiss = useCallback(() => {
    dismissAssistantOnboarding();
    setSkipSession(true);
    setVisible(false);
  }, []);

  const microphoneMessage = useMemo(() => {
    if (microOnboardingCompleted) return null;
    return Lang.assistant.onboarding.microRequirement;
  }, [microOnboardingCompleted]);

  if (!visible) {
    return null;
  }

  return (
    <div className="assistant-onboarding" role="dialog" aria-modal="true" aria-labelledby="assistant-onboarding-title">
      <div className="assistant-onboarding__backdrop" />
      <div className="assistant-onboarding__modal">
        <h2 id="assistant-onboarding-title">{Lang.assistant.onboarding.title}</h2>
        <p className="assistant-onboarding__description">{Lang.assistant.onboarding.description}</p>
        {microphoneMessage && (
          <p className="assistant-onboarding__note">{microphoneMessage}</p>
        )}
        <div className="assistant-onboarding__actions">
          <button
            type="button"
            className="assistant-onboarding__button assistant-onboarding__button--primary"
            onClick={handleStart}
          >
            {Lang.assistant.onboarding.start}
          </button>
          <button
            type="button"
            className="assistant-onboarding__button assistant-onboarding__button--secondary"
            onClick={handleDismiss}
          >
            {Lang.assistant.onboarding.dismiss}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantOnboardingDialog;
