export interface SearchableFields {
  description?: string;
  name?: string;
  category?: string;
  value?: number;
}

const DESCRIPTION_WEIGHT = 4;
const NAME_WEIGHT = 1;
const CATEGORY_WEIGHT = 2;
const VALUE_WEIGHT = 3;
const NUMBER_THRESHOLD = 100;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map(t => t.trim())
    .filter(Boolean);
}

function scoreText(token: string, field: string, weight: number): number {
  const lower = field.toLowerCase();
  if (lower === token) return weight * 2; // exact match
  if (lower.includes(token)) return weight; // partial match
  return 0;
}

function scoreNumber(token: string, value?: number): number {
  if (value === undefined) return 0;
  const num = Number(token);
  if (isNaN(num)) return 0;
  const diff = Math.abs(value - num);
  if (diff === 0) return 10; // rare exact match bonus
  if (diff > NUMBER_THRESHOLD) return 0;
  const proximity = 1 - diff / NUMBER_THRESHOLD; // 0..1
  return proximity * VALUE_WEIGHT;
}

export function searchScore(query: string, fields: SearchableFields): number {
  const tokens = tokenize(query);
  let score = 0;
  for (const token of tokens) {
    const num = Number(token);
    if (!isNaN(num)) {
      score += scoreNumber(token, fields.value);
      continue;
    }
    if (fields.name) score += scoreText(token, fields.name, NAME_WEIGHT);
    if (fields.category) score += scoreText(token, fields.category, CATEGORY_WEIGHT);
    if (fields.description) score += scoreText(token, fields.description, DESCRIPTION_WEIGHT);
  }
  return score;
}

export default searchScore;
