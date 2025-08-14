import { FieldValue, increment } from 'firebase/firestore';

export interface ResourceUseNode<T = number> {
  [key: string]: T | ResourceUseNode<T> | undefined;
}

export interface AIUse<T = number> extends ResourceUseNode<T> {
  input?: T;
  output?: T;
  requests?: T;
}

export interface ResourceUse<T = number> extends ResourceUseNode<T> {
  queryReads?: T;
  docReads?: T;
  writes?: T;
}

export type AIUses<T = number> = {
  [model: string]: AIUse<T>
} 

export interface DatabasesUse<T = number> extends ResourceUseNode<T> {
  db?: {
    remote?: ResourceUse<T>;
    local?: ResourceUse<T>;
    cache?: ResourceUse<T>;
  }
  ai?: AIUses<T>;
}

export type FirestoreDatabasesUse = Partial<ResourceUse<FieldValue>>

export const createEmptyUse = (): DatabasesUse => ({
  db: {
    remote: { queryReads: 0, docReads: 0, writes: 0 },
    local: { queryReads: 0, docReads: 0, writes: 0 },
    cache: { queryReads: 0, docReads: 0, writes: 0 },
  },
  ai: {},
});

export const incrementUseValues = (
  use: DatabasesUse
): FirestoreDatabasesUse => {
  const result: FirestoreDatabasesUse = {};
  for (const [key, value] of Object.entries(use)) {
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

export const sumValues = <T extends ResourceUseNode>(
  source: Partial<T> = {},
  adition: Partial<T> = {},
  copy: boolean = true
): Partial<T> => {
  const result = copy ? copyRecursive(source) : source;
  for (const [key, value] of Object.entries(adition)) {
    const current = source[key];
    if (typeof value === 'number') {
      result[key] = (typeof current === 'number' ? current : 0) + value;
    } else {
      if (typeof current !== 'object' || current === null) {
        result[key] = {};
      }
      result[key] = sumValues(source[key] as ResourceUseNode, value, copy);
    }
  }
  return result as Partial<T>;
};

function copyRecursive(obj: ResourceUseNode): ResourceUseNode {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  const copy: ResourceUseNode = {};
  for (const [key, value] of Object.entries(obj)) {
    copy[key] = copyRecursive(value as any);
  }
  return copy;
}
