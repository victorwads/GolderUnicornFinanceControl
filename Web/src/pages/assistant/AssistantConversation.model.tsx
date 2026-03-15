import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AiCallContext, type AiModel } from "@models";
import type { Repositories } from "@repositories";
import getRepositories from "@repositories";
import { getAssistantModel, setAssistantModel, setPendingAiContext } from "@features/assistant/AssistantController";
import {
  AssistantHistoryDetailRoute,
  AssistantHistoryDetailViewModel,
  ToAssistantListRoute,
} from "@layouts/assistant/AssistantHistoryDetail";
import { buildAssistantHistoryConversation, buildAssistantHistoryConversations } from "./assistantHistoryAdapter";

export function useAssistantConversationModel(): AssistantHistoryDetailViewModel {
  const router = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const repositories = useRepositories();
  const [contexts, setContexts] = useState<AiCallContext[]>([]);
  const isDeveloperMode = window.isDevelopment === true;

  useEffect(() => {
    if (!repositories) return;

    const sync = () => setContexts(repositories.aiCalls.getCache().slice());
    sync();
    repositories.aiCalls.getAll().then((items) => setContexts(items)).catch(sync);
    return repositories.aiCalls.addUpdatedEventListenner(sync);
  }, [repositories]);

  const conversations = useMemo(() => buildAssistantHistoryConversations(contexts), [contexts]);
  const selectedConversation = useMemo(() => {
    const selected = conversations.find((conversation) => conversation.id === conversationId);
    return selected ?? (contexts[0] ? buildAssistantHistoryConversation(contexts[0]) : undefined);
  }, [conversationId, contexts, conversations]);

  function navigate(route: AssistantHistoryDetailRoute) {
    switch (true) {
      case route instanceof ToAssistantListRoute:
        router("/assistant");
        break;
      default:
        console.warn("Unknown route type", route);
        break;
    }
  }

  return {
    navigate,
    conversation: selectedConversation ?? createEmptyConversation(),
    isDeveloperMode,
    modelOptions: AiCallContext.PriceModels,
    selectedModel: getAssistantModel(),
    onModelChange: (model) => {
      if (!isDeveloperMode) return;
      setAssistantModel(model as AiModel);
    },
    onResumeConversation: () => {
      if (!selectedConversation) return;
      setPendingAiContext(selectedConversation.context);
      router("/home");
    },
  };
}

function createEmptyConversation() {
  const context = new AiCallContext(
    "empty",
    getAssistantModel(),
    getAssistantModel(),
    "OpenRouter",
    [],
    [],
    [],
    "not_found",
    null,
    { input: 0, output: 0 },
    2
  );
  return buildAssistantHistoryConversation(context);
}

function useRepositories(): Repositories | null {
  const [repositories, setRepositories] = useState<Repositories | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;

    const sync = () => {
      try {
        const next = getRepositories();
        if (!cancelled) setRepositories(next);
        return true;
      } catch {
        return false;
      }
    };

    if (!sync()) {
      timer = window.setInterval(() => {
        if (sync() && timer !== null) {
          window.clearInterval(timer);
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      if (timer !== null) window.clearInterval(timer);
    };
  }, []);

  return repositories;
}
