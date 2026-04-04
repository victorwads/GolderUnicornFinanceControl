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
    processing, penddingAnswer, isOpen, setIsOpen,
    conversationId, history, sendUserAnswer, isFinished, startNewConversation
  } = useAssistantContext();

  const clear = () => {
    setDraft("");
    clearAutoSend();
    stopMic();
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
    penddingAnswer, draft,
    setDraft, onAutoSend: onSend
  });

  useEffect(() => {
    if (!isFinished || getAssistantMicrophoneMode() !== "live") return;
    clear();
    setIsOpen(false);
  }, [isFinished]);
  
  const visibleEntries = isOpen
    ? history
    : history.slice(-ACTIVE_COLLAPSED_MESSAGES_COUNT);

  return {
    open: isOpen && !processing,
    isActive: isListening || processing, // || penddingAnswer,
    conversationId,
    visibleEntries,
    draft,
    isFinished,
    isListening: isListening,
    autoSendProgress,
    loading: processing,
    onDraftChange: setDraft,
    toggleMic,
    onMicrophonePressStart: startPressMic,
    onMicrophonePressEnd: endPressMic,
    onClose: () => setIsOpen(false),
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
