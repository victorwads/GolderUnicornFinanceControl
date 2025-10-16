import { AiCallContext } from "@models";
import getRepositories, { type Repositories } from "@repositories";

export const MONTHLY_AI_COST_LIMIT_BRL = 5;
export const MONTHLY_LIMIT_REACHED_MESSAGE =
  "Você atingiu o limite de uso da sua conta deste mês. O limite é resetado no último dia do mês.";

function getRelevantTimestamp(context: AiCallContext): Date | null {
  const finishedAt = context.finishedAt instanceof Date ? context.finishedAt : null;
  if (finishedAt) return finishedAt;
  const updatedAt = context._updatedAt instanceof Date ? context._updatedAt : null;
  if (updatedAt) return updatedAt;
  const createdAt = context._createdAt instanceof Date ? context._createdAt : null;
  return createdAt;
}

export async function getCurrentMonthAiCostBRL(
  repositories: Repositories = getRepositories()
): Promise<number> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const calls = await repositories.aiCalls.getAll();

  return calls.reduce((total, call) => {
    const timestamp = getRelevantTimestamp(call);
    if (!timestamp) return total;
    if (timestamp < monthStart || timestamp >= monthEnd) return total;
    return total + call.getCostBRL();
  }, 0);
}

export async function ensureMonthlyLimit(
  repositories: Repositories = getRepositories()
): Promise<{ allowed: boolean; total: number }> {
  const total = await getCurrentMonthAiCostBRL(repositories);
  const normalizedTotal = Number(total.toFixed(2));
  return {
    allowed: normalizedTotal < MONTHLY_AI_COST_LIMIT_BRL,
    total: normalizedTotal,
  };
}
