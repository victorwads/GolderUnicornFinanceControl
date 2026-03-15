import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AiCallContext } from "@models";
import getRepositories from "@repositories";
import { ResourceUsage as ResourceUsageData, ResourceUseChannel } from "@resourceUse";
import {
  ResourceUsageRoute,
  ToMoreRoute,
  AIModel,
  DatabaseUsageCard,
  ResourceUsageSummary,
  ResourceUsageViewModel,
} from "@layouts/settings/ResourceUsage";
import { getCurrentMonthAiCostBRL, MONTHLY_AI_COST_LIMIT_BRL } from "@features/assistant/costControl";
import { USD_TO_BRL } from "../../data/constants/currency";

export function useResourceUsageModel(): ResourceUsageViewModel {
  const router = useNavigate();
  const repositories = getRepositories();
  const [usage, setUsage] = useState<ResourceUsageData>(repositories.resourcesUse.currentUse || {});
  const [monthlyAiCostBRL, setMonthlyAiCostBRL] = useState(0);

  useEffect(() => {
    const unsubscribe = ResourceUseChannel.subscribe(() => {
      setUsage({ ...(repositories.resourcesUse.currentUse || {}) });
    });
    return unsubscribe;
  }, [repositories]);

  useEffect(() => {
    let cancelled = false;

    const syncMonthlyCost = async () => {
      try {
        const value = await getCurrentMonthAiCostBRL(repositories);
        if (!cancelled) {
          setMonthlyAiCostBRL(Number(value.toFixed(2)));
        }
      } catch {
        if (!cancelled) {
          setMonthlyAiCostBRL(0);
        }
      }
    };

    syncMonthlyCost();
    const unsubscribe = repositories.aiCalls.addUpdatedEventListenner(() => {
      syncMonthlyCost();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [repositories]);

  function navigate(route: ResourceUsageRoute) {
    switch (true) {
      case route instanceof ToMoreRoute:
        router("/settings");
        break;

      default:
        console.warn("Unknown route type", route);
        break;
    }
  }

  const databases: DatabaseUsageCard[] = Object.entries(usage.db || {}).map(([name, item]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    reads: Number(item?.docReads || 0),
    writes: Number(item?.writes || 0),
    queryReads: Number(item?.queryReads || 0),
  }));

  const aiEntries = Object.entries(usage.ai || {});
  const aiModels: AIModel[] = aiEntries.map(([name, stats]) => ({
    name,
    requests: typeof stats?.requests === "number" ? stats.requests : null,
    tokensIn: typeof stats?.input === "number" ? stats.input : null,
    tokensOut: typeof stats?.output === "number" ? stats.output : null,
  }));

  const summary: ResourceUsageSummary = aiEntries.reduce(
    (acc, [, stats]) => {
      acc.totalRequests += Number(stats?.requests || 0);
      acc.tokensIn += Number(stats?.input || 0);
      acc.tokensOut += Number(stats?.output || 0);
      return acc;
    },
    {
      totalRequests: 0,
      tokensIn: 0,
      tokensOut: 0,
      estimatedCostBRL: AiCallContext.getCurrentCosts(usage.ai).dolars * USD_TO_BRL,
    }
  );

  return {
    navigate,
    aiModels,
    databases,
    monthlyUsage: {
      currentCostBRL: monthlyAiCostBRL,
      limitBRL: MONTHLY_AI_COST_LIMIT_BRL,
      progressPercent: Math.min((monthlyAiCostBRL / MONTHLY_AI_COST_LIMIT_BRL) * 100, 100),
      exceededAmountBRL: monthlyAiCostBRL > MONTHLY_AI_COST_LIMIT_BRL
        ? Number((monthlyAiCostBRL - MONTHLY_AI_COST_LIMIT_BRL).toFixed(2))
        : null,
    },
    summary,
  };
}
