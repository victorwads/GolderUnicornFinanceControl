import { increment } from 'firebase/firestore';

export type UseNode = Record<string, number | UseNode>;
export type BDUseNode = Record<string, ReturnType<typeof increment> | BDUseNode>;

export const incrementUseValues = (obj: UseNode): BDUseNode => {
  const result: BDUseNode = {};
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

export const sumValues = (base: UseNode = {}, local: UseNode = {}): UseNode => {
  const result: UseNode = {};
  const keys = new Set([...Object.keys(base || {}), ...Object.keys(local || {})]);
  keys.forEach((key) => {
    const b = (base as any)[key];
    const l = (local as any)[key];
    if (typeof b === 'number' || typeof l === 'number') {
      const bn = typeof b === 'number' ? b : 0;
      const ln = typeof l === 'number' ? l : 0;
      result[key] = bn + ln;
    } else {
      const nested = sumValues(b || {}, l || {});
      if (Object.keys(nested).length > 0) {
        result[key] = nested;
      }
    }
  });
  return result;
};

