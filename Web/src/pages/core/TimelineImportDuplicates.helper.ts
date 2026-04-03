import { AccountsRegistry, CreditCardRegistry } from "@models";
import { ParsedOfxTransaction } from "@features/tabs/timeline/ofxParser";

export type DuplicateState = "none" | "warning" | "blocked";

export interface DuplicateAnalysisItem {
  state: DuplicateState;
  reason?: string;
  matched?: {
    id?: string;
    description: string;
    value: number;
    date: Date;
    categoryId?: string;
    tags?: string[];
  };
}

export interface DuplicateAnalysisResult {
  byPreviewId: Record<string, DuplicateAnalysisItem>;
  autoDeselectedIds: string[];
}

interface Candidate {
  id?: string;
  categoryId?: string;
  tags?: string[];
  value: number;
  description: string;
  normalizedDescription: string;
  date: Date;
}

const WARNING_DESELECT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const WARNING_KEEP_WINDOW_DAYS = 1; // +/- 1 day
const DAY_MS = 24 * 60 * 60 * 1000;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function normalizeValue(value: number): number {
  return Math.round(Math.abs(value) * 100) / 100;
}

function isExactDateTime(a: Date, b: Date): boolean {
  return Math.floor(a.getTime() / 1000) === Math.floor(b.getTime() / 1000);
}

function isSameDateHour(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate() &&
    a.getHours() === b.getHours()
  );
}

function isWithinMs(a: Date, b: Date, windowMs: number): boolean {
  const diff = Math.abs(a.getTime() - b.getTime());
  return diff > 0 && diff <= windowMs;
}

function isNearDateDays(a: Date, b: Date, daysWindow: number): boolean {
  const diff = Math.abs(a.getTime() - b.getTime());
  return diff > 0 && diff <= daysWindow * DAY_MS;
}

function toCandidate(registry: AccountsRegistry | CreditCardRegistry): Candidate {
  return {
    id: registry.id,
    categoryId: registry.categoryId,
    tags: registry.tags,
    value: normalizeValue(registry.value),
    description: registry.description,
    normalizedDescription: normalizeText(registry.description),
    date: registry.date,
  };
}

function buildPreviewId(item: ParsedOfxTransaction): string {
  return `${item.fitId ?? item.description}-${item.date.getTime()}-${item.amount}`;
}

export function analyzeOfxDuplicates(
  transactions: ParsedOfxTransaction[],
  existingRegistries: Array<AccountsRegistry | CreditCardRegistry>
): DuplicateAnalysisResult {
  const byPreviewId: Record<string, DuplicateAnalysisItem> = {};
  const autoDeselectedIds: string[] = [];
  const candidates = existingRegistries.map(toCandidate);

  transactions.forEach((item) => {
    const previewId = buildPreviewId(item);
    const value = normalizeValue(item.amount);
    const description = normalizeText(item.description);
    const date = item.date;

    const exactMatch = candidates.find((candidate) =>
      candidate.value === value &&
      candidate.normalizedDescription === description &&
      isExactDateTime(candidate.date, date)
    );

    if (exactMatch) {
      byPreviewId[previewId] = {
        state: "blocked",
        reason: "Foi encontrado um registro idêntico (descricao, valor e data/hora iguais).",
        matched: {
          id: exactMatch.id,
          description: exactMatch.description,
          value: exactMatch.value,
          date: exactMatch.date,
          categoryId: exactMatch.categoryId,
          tags: exactMatch.tags,
        },
      };
      autoDeselectedIds.push(previewId);
      return;
    }

    const sameValueSameHour = candidates.find((candidate) =>
      candidate.value === value && isSameDateHour(candidate.date, date)
    );

    if (sameValueSameHour) {
      byPreviewId[previewId] = {
        state: "blocked",
        reason: "Foi encontrado um registro com o mesmo valor na mesma data/hora.",
        matched: {
          id: sameValueSameHour.id,
          description: sameValueSameHour.description,
          value: sameValueSameHour.value,
          date: sameValueSameHour.date,
          categoryId: sameValueSameHour.categoryId,
          tags: sameValueSameHour.tags,
        },
      };
      autoDeselectedIds.push(previewId);
      return;
    }

    const sameValueWithinOneHour = candidates.find((candidate) =>
      candidate.value === value && isWithinMs(candidate.date, date, WARNING_DESELECT_WINDOW_MS)
    );

    if (sameValueWithinOneHour) {
      byPreviewId[previewId] = {
        state: "warning",
        reason: "Foi encontrado um registro com o mesmo valor com diferenca de ate 1 hora.",
        matched: {
          id: sameValueWithinOneHour.id,
          description: sameValueWithinOneHour.description,
          value: sameValueWithinOneHour.value,
          date: sameValueWithinOneHour.date,
          categoryId: sameValueWithinOneHour.categoryId,
          tags: sameValueWithinOneHour.tags,
        },
      };
      autoDeselectedIds.push(previewId);
      return;
    }

    const sameValueNearDate = candidates.find((candidate) =>
      candidate.value === value && isNearDateDays(candidate.date, date, WARNING_KEEP_WINDOW_DAYS)
    );

    if (sameValueNearDate) {
      byPreviewId[previewId] = {
        state: "warning",
        reason: "Foi encontrado um registro com o mesmo valor em data proxima (ate 1 dia).",
        matched: {
          id: sameValueNearDate.id,
          description: sameValueNearDate.description,
          value: sameValueNearDate.value,
          date: sameValueNearDate.date,
          categoryId: sameValueNearDate.categoryId,
          tags: sameValueNearDate.tags,
        },
      };
      return;
    }

    byPreviewId[previewId] = { state: "none" };
  });

  return { byPreviewId, autoDeselectedIds };
}
