import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { AssistantHistoryConversation, AssistantTimelineEntry } from "@pages/assistant/assistantHistory.types";
import { buildAssistantHistoryConversation, buildTimelineEntries } from "@pages/assistant/assistantHistoryAdapter";
import AssistantController, { setPendingAiContext } from "./AssistantController";

type AssistantContextValue = {
  conversationId: string | null;
  history: AssistantTimelineEntry[];
  processing: boolean;
  isFinished: boolean;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  sendUserAnswer: (answer: string) => void;
  openWithConversation: (conversation: AssistantHistoryConversation) => void;
  startNewConversation: () => void;
};

let sendUserAnswerRef: ((answer: string) => void) | null = null;

const AssistantContext = createContext<AssistantContextValue | undefined>(undefined);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [processing, setProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<AssistantTimelineEntry[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const navigate = useNavigate();
  
  const controller = useMemo(() => 
    new AssistantController(
      () => new Promise<string>((resolve) => {
        sendUserAnswerRef = (answer: string) => resolve(answer);
        setProcessing(false);
      }),
      (_, context) => {
        setHistory(buildTimelineEntries(context));
      },
      (route: string, queryParams?: Record<string, string>) => {
        const url = new URL("u:" + route);
        Object.entries(queryParams || {}).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });

        navigate({
          pathname: url.pathname, search: url.search
        });
      },
      (context) => {
        setConversationId(context.id);
        setHistory(buildTimelineEntries(context));
        setIsFinished(Boolean(context.finishReason?.startsWith("finished_by_assistant")));
      },
    ),
    []
  );

  return <AssistantContext.Provider value={{
    conversationId,
    history,
    processing,
    isFinished,
    isOpen,
    setIsOpen,
    sendUserAnswer: (answer: string) => {
      if (isFinished) {
        return;
      }
      setProcessing(true);
      if (sendUserAnswerRef) {
        sendUserAnswerRef?.(answer);
        sendUserAnswerRef = null;
        return;
      }

      controller
      .run(answer, CurrentLangInfo.short)
      .finally(() => setProcessing(false));
    },
    openWithConversation: (conversation) => {
      setConversationId(conversation.id);
      setPendingAiContext(conversation.context);
      setHistory(conversation.entries);
      setIsFinished(Boolean(conversation.finishReason?.startsWith("finished_by_assistant")));
      setIsOpen(true);
    },
    startNewConversation: () => {
      sendUserAnswerRef = null;
      setConversationId(null);
      setHistory([]);
      setIsFinished(false);
      setProcessing(false);
      setIsOpen(true);
    },
  }}>{children}</AssistantContext.Provider>;
}

export function useAssistantContext() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error("useAssistantContext must be used within AssistantProvider");
  }

  return context;
}
