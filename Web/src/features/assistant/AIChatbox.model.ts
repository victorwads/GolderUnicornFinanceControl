import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAssistantContext } from "@features/assistant/AssistantContext";
import type { AIChatboxViewModel } from "@layouts/assistant/AIChatbox";

const ACTIVE_COLLAPSED_MESSAGES_COUNT = 4;

export function useAssistantChatboxModel(): AIChatboxViewModel {
  const [draft, setDraft] = useState("");
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();

  const { 
    processing, penddingAnswer, isOpen, setIsOpen,
    conversationId, history, sendUserAnswer
  } = useAssistantContext();
  const isActive = isListening || processing || penddingAnswer;
  const visibleEntries = isOpen
    ? history
    : history.slice(-ACTIVE_COLLAPSED_MESSAGES_COUNT);

  return {
    open: isOpen,
    isActive,
    conversationId,
    visibleEntries,
    draft,
    isListening,
    autoSendProgress: 0,
    loading: processing,
    onDraftChange: setDraft,
    onMicrophoneToggle: () => setIsListening((current) => !current),
    onClose: () => setIsOpen(false),
    onToggle: () => setIsOpen(!isOpen),
    onSend: () => {
      const nextDraft = draft.trim();
      if (!nextDraft || processing) {
        return;
      }

      setDraft("");
      sendUserAnswer(nextDraft);
    },
    onOpenFullConversation: () => {
      setIsOpen(false);
      navigate(`/assistant/${conversationId}`);
    },
  };
}
