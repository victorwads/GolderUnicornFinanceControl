const BRAZIL_TZ_OFFSET = -3;

const TODAY_KEYWORDS = new Set(['hoje', 'today']);
const YESTERDAY_KEYWORDS = new Set(['ontem', 'yesterday']);
const TOMORROW_KEYWORDS = new Set(['amanha', 'amanhã', 'tomorrow']);

export function resolveDateInput(value?: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;

  if (TODAY_KEYWORDS.has(normalized)) return formatDate(new Date());
  if (YESTERDAY_KEYWORDS.has(normalized)) return formatDate(shiftDate(new Date(), -1));
  if (TOMORROW_KEYWORDS.has(normalized)) return formatDate(shiftDate(new Date(), 1));

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;

  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) return formatDate(new Date(parsed));

  return value; // fallback: let backend decide later
}

function shiftDate(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatDate(date: Date): string {
  const utc = new Date(date.getTime() - (BRAZIL_TZ_OFFSET * 60 * 60 * 1000));
  return utc.toISOString().split('T')[0];
}
