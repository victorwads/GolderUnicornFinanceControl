import { FieldValue } from "firebase/firestore";
import { DocumentModel } from "@models";
import getBroadcastChannel from "@utils/Broadcast";

let STATIC_INSTANTE: ResourcesUseRepository | null = null;
const CHANNEL_NAME = "ResourcesUseRepository";
const MILION = 1000000;

type Dolar = number
const TOKEN_PRICES: AIUses<Dolar, AiModel | 'legacy'> = {
  "gpt-5-nano": { input: 0.05, output: 0.40},
  "gpt-5-mini": { input: 0.25, output: 2.00 },
  "gpt-4.1-nano": { input: 0.10, output: 0.40 },
  "gpt-4.1-mini": { input: 0.40, output: 1.60 },
};
TOKEN_PRICES['legacy'] = TOKEN_PRICES['gpt-4.1-mini'];

export class ResourcesUseModel extends DocumentModel {
  constructor(id: string, public use?: ResourceUsage) {
    super(id);
  }
}

export const ResourceUseChannel = getBroadcastChannel<UsageMsgTypes, ResourceUsage>(CHANNEL_NAME);

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
    const costs = getByModelCosts(model as AiModel, use || {});
    totalTokens += costs.tokens;
    totalDolar += costs.dolars;
  }
  return { tokens: totalTokens, dolars: totalDolar };
}

export function getByModelCosts(model: AiModel, use: AIUse): {
  tokens: number;
  dolars: number;
} {
  let totalTokens = 0, totalDolar = 0, input = use.input || 0, output = use.output || 0;
  const prices = TOKEN_PRICES[model] || { input: 0, output: 0 };
  totalTokens += input + output;
  totalDolar += 
    ( input * (prices.input! / MILION) ) +
    ( output * (prices.output! / MILION) );

  return { tokens: totalTokens, dolars: totalDolar };
}

export type UsageMsgTypes = 'addition'
export type AiModel = "gpt-5-nano" | "gpt-5-mini" | "gpt-4.1-nano" | "gpt-4.1-mini";

export interface ResourcesUseRepository {
  currentUse: ResourceUsage;
  add: (additions: ResourceUsage) => void;
}

export interface ResourceUseNode<T = number> {
  [key: string]: T | ResourceUseNode<T> | undefined;
}

interface DBResourceUse<T = number> extends ResourceUseNode<T> {
  queryReads?: T;
  docReads?: T;
  writes?: T;
}

export interface AIUse<T = number> extends ResourceUseNode<T> {
  input?: T;
  output?: T;
  requests?: T;
}

export type AIUses<T = number, Model extends string = AiModel> = {
  [model in Model]?: AIUse<T>;
};

export interface ResourceUsage<T = number> extends ResourceUseNode<T> {
  db?: {
    remote?: DBResourceUse<T>;
    local?: DBResourceUse<T>;
  };
  ai?: AIUses<T>;
}

export type FirestoreDatabasesUse = Partial<DBResourceUse<FieldValue>>;

ResourceUseChannel.subscribe((type, payload) => {
  if (type !== 'addition') return;
  (STATIC_INSTANTE as any)?._add(payload);
});
