import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAssistantContext } from "@features/assistant/AssistantContext";
import { useAIChatboxMicrophoneModel } from "@features/assistant/AIChatboxMicrophone.model";
import type { AIChatboxViewModel } from "@layouts/assistant/AIChatbox";

const ACTIVE_COLLAPSED_MESSAGES_COUNT = 4;

export function useAssistantChatboxModel(): AIChatboxViewModel {
  const [draft, setDraft] = useState("");
  const navigate = useNavigate();

  const { 
    processing, penddingAnswer, isOpen, setIsOpen,
    conversationId, history, sendUserAnswer
  } = useAssistantContext();

  const onSend = () => {
    const nextDraft = draft.trim();
    if (!nextDraft || processing) {
      return;
    }

    clearAutoSend();
    setDraft("");
    sendUserAnswer(nextDraft);
    stopMic();
  }

  const {
    autoSendProgress, isListening,
    toggleMic, startPressMic, endPressMic, stopMic, clearAutoSend,
  } = useAIChatboxMicrophoneModel({
    penddingAnswer, draft,
    setDraft, onAutoSend: onSend
  });
  
  const isActive = isListening || processing || penddingAnswer;
  const visibleEntries = isOpen
    ? history
    : history.slice(-ACTIVE_COLLAPSED_MESSAGES_COUNT);

  return {
    open: isOpen && !processing,
    isActive,
    conversationId,
    visibleEntries,
    draft,
    isListening: isListening,
    autoSendProgress,
    loading: processing,
    onDraftChange: setDraft,
    toggleMic,
    onMicrophonePressStart: startPressMic,
    onMicrophonePressEnd: endPressMic,
    onClose: () => setIsOpen(false),
    onToggle: () => setIsOpen(!isOpen),
    onSend,
    onOpenFullConversation: () => {
      setIsOpen(false);
      navigate(`/assistant/${conversationId}`);
    },
  };
}
