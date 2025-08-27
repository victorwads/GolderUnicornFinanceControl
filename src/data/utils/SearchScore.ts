export interface SearchableFields {
  description?: string;
  name?: string;
  category?: string;
  value?: number;
}

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
  const diff = Math.abs(Math.abs(value) - Math.abs(num));
  if (diff === 0) return 4;
  if (diff <= 1) return 3;
  if (diff <= 3) return 2;
  if (diff <= 10) return 1;
  return 0;
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
    if (fields.name) score += scoreText(token, fields.name, 3);
    if (fields.category) score += scoreText(token, fields.category, 3);
    if (fields.description) score += scoreText(token, fields.description, 1);
  }
  return score;
}

export default searchScore;
