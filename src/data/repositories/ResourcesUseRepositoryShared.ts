import { FieldValue } from "firebase/firestore";
import { DocumentModel } from "@models";

type Dolar = number
type AiModel = "gpt-5-nano" | "gpt-5-mini" | "gpt-4.1-nano" | "gpt-4.1-mini";
const MILION = 1000000;
const TOKEN_PRICES: AIUses<Dolar, AiModel | 'legacy'> = {
  "gpt-5-nano": { input: 0.05, output: 0.40},
  "gpt-5-mini": { input: 0.25, output: 2.00 },
  "gpt-4.1-nano": { input: 0.10, output: 0.40 },
  "gpt-4.1-mini": { input: 0.40, output: 1.60 },
};
TOKEN_PRICES['legacy'] = TOKEN_PRICES['gpt-4.1-mini'];

let STATIC_INSTANTE: ResourcesUseRepository | null = null;
export class ResourcesUseModel extends DocumentModel {

  constructor(id: string, public use?: ResourceUsage) {
    super(id);
  }
}

export function setInstance(instance: typeof STATIC_INSTANTE): void {
  STATIC_INSTANTE = instance
}

export function addResourceUse(additions: ResourceUsage): void {
  if (!STATIC_INSTANTE)
    throw new Error("ResourcesUseRepository not initialized");
  STATIC_INSTANTE.add(additions);
}

export function getCurrentCosts(uses?: AIUses): {
  tokens: number;
  dolars: number;
} {
  let totalTokens = 0, totalDolar = 0;

  const modelsUse = Object.entries(uses || STATIC_INSTANTE?.currentUse?.ai || {});
  for (const [model, use] of modelsUse) {
    const prices = TOKEN_PRICES[model as AiModel] || { input: 0, output: 0 };
    totalTokens += use.input + use.output;
    totalDolar += 
      ( use.input * (prices.input / MILION) ) +
      ( use.output * (prices.output / MILION) );
  }
  return { tokens: totalTokens, dolars: totalDolar };
}

export interface ResourcesUseRepository {
  currentUse: ResourceUsage;
  add: (additions: ResourceUsage) => void;
}

export interface ResourceUseNode<T = number> {
  [key: string]: T | ResourceUseNode<T> | undefined;
}

interface ResourceUse<T = number> extends ResourceUseNode<T> {
  queryReads?: T;
  docReads?: T;
  writes?: T;
}

export interface AIUse<T = number> extends ResourceUseNode<T> {
  input: T;
  output: T;
  requests?: T;
}

export type AIUses<T = number, Model extends string = AiModel> = {
  [model in Model]?: AIUse<T>;
};

export interface ResourceUsage<T = number> extends ResourceUseNode<T> {
  db?: {
    remote?: ResourceUse<T>;
    local?: ResourceUse<T>;
    cache?: ResourceUse<T>;
  };
  ai?: AIUses<T>;
}

export type FirestoreDatabasesUse = Partial<ResourceUse<FieldValue>>;
