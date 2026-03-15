import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AiCallContext, type AiModel } from "@models";
import type { Repositories } from "@repositories";
import getRepositories from "@repositories";
import { getAssistantModel, setAssistantModel } from "@features/assistant/AssistantController";
import { getCurrentMonthAiCostBRL, MONTHLY_AI_COST_LIMIT_BRL } from "@features/assistant/costControl";
import {
  AssistantHistoryListViewModel,
  AssistantHistoryRoute,
  ToConversationRoute,
  ToMoreRoute,
} from "@layouts/assistant/AssistantHistoryList";
import { buildAssistantHistoryConversations } from "./assistantHistoryAdapter";

export function useAssistantHistoryModel(): AssistantHistoryListViewModel {
  const router = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const repositories = useRepositories();
  const [contexts, setContexts] = useState<AiCallContext[]>([]);
  const [monthlyCostBRL, setMonthlyCostBRL] = useState(0);
  const isDeveloperMode = window.isDevelopment === true;

  useEffect(() => {
    if (!repositories) return;

    const sync = () => setContexts(repositories.aiCalls.getCache().slice());
    sync();
    repositories.aiCalls.getAll().then((items) => setContexts(items)).catch(sync);
    return repositories.aiCalls.addUpdatedEventListenner(sync);
  }, [repositories]);

  useEffect(() => {
    if (!repositories) return;

    let cancelled = false;
    const syncMonthlyCost = async () => {
      const value = await getCurrentMonthAiCostBRL(repositories).catch(() => 0);
      if (!cancelled) setMonthlyCostBRL(Number(value.toFixed(2)));
    };

    void syncMonthlyCost();
    const unsubscribe = repositories.aiCalls.addUpdatedEventListenner(() => {
      void syncMonthlyCost();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [repositories]);

  const conversations = useMemo(() => buildAssistantHistoryConversations(contexts), [contexts]);

  function navigate(route: AssistantHistoryRoute) {
    switch (true) {
      case route instanceof ToMoreRoute:
        router("/settings");
        break;
      case route instanceof ToConversationRoute:
        router(`/assistant/${route.conversationId}`);
        break;
      default:
        console.warn("Unknown route type", route);
        break;
    }
  }

  return {
    navigate,
    conversations,
    selectedConversationId: conversationId,
    monthlyUsage: {
      currentCostBRL: monthlyCostBRL,
      limitBRL: MONTHLY_AI_COST_LIMIT_BRL,
      progressPercent: Math.min((monthlyCostBRL / MONTHLY_AI_COST_LIMIT_BRL) * 100, 100),
      exceededAmountBRL:
        monthlyCostBRL > MONTHLY_AI_COST_LIMIT_BRL
          ? Number((monthlyCostBRL - MONTHLY_AI_COST_LIMIT_BRL).toFixed(2))
          : null,
    },
    isDeveloperMode,
    modelOptions: AiCallContext.PriceModels,
    selectedModel: getAssistantModel(),
    onModelChange: (model) => {
      if (!isDeveloperMode) return;
      setAssistantModel(model as AiModel);
    },
  };
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
