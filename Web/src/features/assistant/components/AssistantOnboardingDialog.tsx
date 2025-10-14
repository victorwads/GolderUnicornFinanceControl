import './AssistantOnboardingDialog.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Button from '@components/ui/Button';
import Dialog, { DialogBody, DialogDescription, DialogFooter, DialogTitle } from '@components/visual/Dialog';
import getRepositories, { User } from '@repositories';
import { hasCompletedAIMicrophoneOnboarding } from '@components/voice/AIMicrophoneOnboarding.model';
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

  const titleId = "assistant-onboarding-title";
  const descriptionId = `${titleId}-description`;

  return (
    <Dialog
      open={visible}
      onClose={handleDismiss}
      closeOnBackdrop={false}
      labelledBy={titleId}
      describedBy={descriptionId}
      size="md"
      contentClassName="assistant-onboarding"
    >
      <DialogBody className="assistant-onboarding__body">
        <DialogTitle id={titleId}>{Lang.assistant.onboarding.title}</DialogTitle>
        <DialogDescription id={descriptionId}>
          {Lang.assistant.onboarding.description}
        </DialogDescription>
        {microphoneMessage && (
          <p className="assistant-onboarding__note">{microphoneMessage}</p>
        )}
      </DialogBody>
      <DialogFooter>
        <Button onClick={handleStart}>{Lang.assistant.onboarding.start}</Button>
        <Button variant="secondary" onClick={handleDismiss}>
          {Lang.assistant.onboarding.dismiss}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default AssistantOnboardingDialog;
