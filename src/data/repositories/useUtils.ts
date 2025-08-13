import { increment } from 'firebase/firestore';

// Generic node describing a hierarchy of resource usage values
export interface ResourceUseNode {
  [key: string]: number | ResourceUseNode;
}

// Represents usage for a given AI model
export interface AIModelUse {
  inputTokens: number;
  outputTokens: number;
  requests: number;
}

// Root structure for resource usage allowing additional dynamic nodes
export interface ResourceUse extends ResourceUseNode {
  ai: Record<string, AIModelUse>;
}

export interface DatabaseUse {
  queryReads: number;
  docReads: number;
  writes: number;
}

export interface OpenAIUse {
  tokens: { input: number; output: number };
  requests: number;
}

export interface DatabasesUse extends ResourceUse {
  remote: DatabaseUse;
  local: DatabaseUse;
  cache: DatabaseUse;
  openai: OpenAIUse;
}

// Firestore increment structure
export type FirestoreUseNode = Record<
  string,
  ReturnType<typeof increment> | FirestoreUseNode
>;

export const createEmptyUse = (): DatabasesUse => ({
  remote: { queryReads: 0, docReads: 0, writes: 0 },
  local: { queryReads: 0, docReads: 0, writes: 0 },
  cache: { queryReads: 0, docReads: 0, writes: 0 },
  openai: { tokens: { input: 0, output: 0 }, requests: 0 },
  ai: {},
});

export const incrementUseValues = (
  obj: ResourceUseNode
): FirestoreUseNode => {
  const result: FirestoreUseNode = {};
  for (const [key, value] of Object.entries(obj || {})) {
    if (typeof value === 'number') {
      result[key] = increment(value);
    } else if (value) {
      const nested = incrementUseValues(value);
      if (Object.keys(nested).length > 0) {
        result[key] = nested as any;
      }
    }
  }
  return result;
};

// Mutates target by summing values from source recursively
export const sumValues = (
  target: ResourceUseNode = {},
  source: ResourceUseNode = {}
): ResourceUseNode => {
  for (const [key, value] of Object.entries(source || {})) {
    const current = (target as any)[key];
    if (typeof value === 'number') {
      (target as any)[key] = (typeof current === 'number' ? current : 0) + value;
    } else {
      if (typeof current !== 'object' || current === null) {
        (target as any)[key] = {};
      }
      sumValues((target as any)[key], value);
    }
  }
  return target;
};

