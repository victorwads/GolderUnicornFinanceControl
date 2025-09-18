/**
 * Utility helpers for future fuzzy search integrations.
 * These functions are pure and side-effect free so they can be plugged into
 * real repository queries later without changes to the assistant orchestration.
 */
export function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export function tokenize(input: string): string[] {
  return normalizeText(input)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Computes a simple similarity score between 0 and 1 using token overlap with
 * a lightweight bigram bonus. This is intentionally simple and inexpensive.
 */
export function scoreSimilarity(source: string, target: string): number {
  if (!source || !target) return 0;
  const sourceTokens = new Set(tokenize(source));
  const targetTokens = new Set(tokenize(target));
  if (!sourceTokens.size || !targetTokens.size) return 0;

  let intersection = 0;
  for (const token of targetTokens) {
    if (sourceTokens.has(token)) intersection += 1;
  }

  const union = sourceTokens.size + targetTokens.size - intersection;
  const jaccard = union === 0 ? 0 : intersection / union;

  const sourceBigrams = buildBigrams(normalizeText(source));
  const targetBigrams = buildBigrams(normalizeText(target));
  const bigramScore = cosineSimilarity(sourceBigrams, targetBigrams);

  return Number(((jaccard * 0.7) + (bigramScore * 0.3)).toFixed(4));
}

export interface RankedResult<T> {
  item: T;
  score: number;
}

/**
 * Orders the provided items by similarity score, highest first.
 * Consumers can later plug repository data and choose their own selectors.
 */
export function rankBySimilarity<T>(
  query: string,
  items: T[],
  selector: (item: T) => string
): RankedResult<T>[] {
  return items
    .map((item) => ({ item, score: scoreSimilarity(query, selector(item)) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
}

function buildBigrams(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (let i = 0; i < text.length - 1; i += 1) {
    const bigram = text.slice(i, i + 2);
    if (!bigram.trim()) continue;
    counts.set(bigram, (counts.get(bigram) || 0) + 1);
  }
  return counts;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (const value of a.values()) magnitudeA += value * value;
  for (const value of b.values()) magnitudeB += value * value;

  const smaller = a.size < b.size ? a : b;
  const larger = smaller === a ? b : a;
  for (const [key, value] of smaller.entries()) {
    const other = larger.get(key);
    if (other) dotProduct += value * other;
  }

  const denom = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (denom === 0) return 0;
  return dotProduct / denom;
}
