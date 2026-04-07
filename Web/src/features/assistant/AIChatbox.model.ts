import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAssistantContext } from "@features/assistant/AssistantContext";
import { useAIChatboxMicrophoneModel } from "@features/assistant/AIChatboxMicrophone.model";
import { getAssistantMicrophoneMode } from "@features/assistant/preferences";
import type { AIChatboxViewModel } from "@layouts/assistant/AIChatbox";

const ACTIVE_COLLAPSED_MESSAGES_COUNT = 6;

export function useAssistantChatboxModel(): AIChatboxViewModel {
  const [draft, setDraft] = useState("");
  const navigate = useNavigate();

  const { 
    processing, isOpen, setIsOpen,
    conversationId, history, sendUserAnswer, isFinished, isOnboardingMode, startNewConversation
  } = useAssistantContext();

  const clear = () => {
    setDraft("");
    clearAutoSend();
    stopMic();
  }

  const closeChatbox = () => {
    clearAutoSend();
    stopMic();
    setIsOpen(false);
  }

  const onSend = () => {
    const nextDraft = draft.trim();
    if (!nextDraft || processing) {
      return;
    }

    clear();
    sendUserAnswer(nextDraft);
  }

  const {
    autoSendProgress, isListening,
    toggleMic, startPressMic, endPressMic, stopMic, clearAutoSend, startMicIfLive,
  } = useAIChatboxMicrophoneModel({
    processing, draft,
    setDraft, onAutoSend: onSend
  });

  useEffect(() => {
    if (!isFinished || getAssistantMicrophoneMode() !== "live") return;
    clear();
    setIsOpen(false);
  }, [isFinished]);
  
  const visibleEntries = true
    ? history
    : history.slice(-ACTIVE_COLLAPSED_MESSAGES_COUNT);

  return {
    open: isOpen && !processing,
    isActive: isListening || processing, // || penddingAnswer,
    conversationId,
    visibleEntries,
    isOnboardingMode,
    draft,
    isFinished,
    isListening: isListening,
    autoSendProgress,
    loading: processing,
    onDraftChange: setDraft,
    toggleMic,
    onMicrophonePressStart: startPressMic,
    onMicrophonePressEnd: endPressMic,
    onClose: closeChatbox,
    onToggle: () => {
      const nextOpen = !isOpen;
      setIsOpen(nextOpen);
      if (nextOpen && !isFinished) startMicIfLive();
    },
    onSend,
    onOpenFullConversation: () => {
      setIsOpen(false);
      navigate(`/assistant/${conversationId}`);
    },
    onStartNewConversation: () => {
      clearAutoSend();
      stopMic();
      setDraft("");
      startNewConversation();
      startMicIfLive();
    },
  };
}
