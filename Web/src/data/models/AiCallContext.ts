import type { ChatCompletionMessageParam } from "openai/resources/index";
import type { ResourceUseNode } from "@resourceUse";

import { DocumentModel } from "./DocumentModel";
import { type Dolar, USD_TO_BRL } from "../constants/currency";

const MILION = 1000000;

export class AiCallContext extends DocumentModel {
  private static TOKEN_PRICES: AIUses<Dolar, AiModel> = {
    "gpt-5.4": { input: 2.50, output: 22.5 },
    "gpt-5.4-mini": { input: 0.75, output: 4.5 },
    "gpt-5.4-nano": { input: 0.20, output: 1.25 },
    "gpt-5.2": { input: 1.75, output: 14.0 },
    "gpt-5.1": { input: 1.25, output: 10.0 },
    "gpt-5": { input: 1.25, output: 10.0 },
    "gpt-4.1": { input: 2.0, output: 8.0 },
    "gpt-5-nano": { input: 0.05, output: 0.4 },
    "gpt-5-mini": { input: 0.25, output: 2.0 },
    "gpt-4.1-nano": { input: 0.1, output: 0.4 },
    "gpt-4.1-mini": { input: 0.4, output: 1.6 },
  };

  constructor(
    public id: string,
    public model: string,
    public preset: string = model,
    public provider: string = "openai",
    public history: AIHistoryMessage[] = [],
    public sharedDomains: string[] = [],
    public warnings: string[] = [],
    public finishReason?: string | null,
    public finishedAt: Date | null = null,
    public tokens = {
      input: 0,
      output: 0,
    },
    public version = 2
  ) {
    super(id);
  }

  public static get PriceModels() {
    return Object.keys(AiCallContext.TOKEN_PRICES);
  }

  public getCostBRL(): number {
    const historyCost = (Array.isArray(this.history) ? this.history : []).reduce((total, entry) => {
      return total + (entry.processing?.inputPrice ?? 0) + (entry.processing?.outputPrice ?? 0);
    }, 0);

    const tokens = this.tokens ?? { input: 0, output: 0 };
    const model = (this.model || "gpt-5.4-nano") as AiModel;
    const { dolars } = AiCallContext.getByModelCosts(model, tokens);
    const cost = historyCost > dolars ? historyCost : dolars
    return cost * USD_TO_BRL;
  }

  public static getModelPricing(model: AiModel): Required<AIUse<Dolar>> | null {
    const pricesNames: string[] = AiCallContext.PriceModels;
    const modelPriceName: string | undefined =
      pricesNames.find(name => name === model) ||
      [...pricesNames]
        .sort((a, b) => b.length - a.length)
        .find(name => model.includes(name));

    if (!modelPriceName) {
      return null;
    }

    return AiCallContext.TOKEN_PRICES[modelPriceName] as Required<AIUse<Dolar>>;
  }

  public static getByModelCosts(model: AiModel, use: AIUse): {
    tokens: number;
    dolars: number;
  } {
    let totalTokens = 0, totalDolar = 0, input = use.input || 0, output = use.output || 0;
    totalTokens += input + output;

    const prices = AiCallContext.getModelPricing(model);
    if (!prices) {
      return { tokens: totalTokens, dolars: 0 };
    }
    totalDolar += 
      ( input * (prices.input / MILION) ) +
      ( output * (prices.output / MILION) );
  
    return { tokens: totalTokens, dolars: totalDolar };
  }

  public static getCurrentCosts(uses?: AIUses): {
    tokens: number;
    dolars: number;
  } {
    let totalTokens = 0,
      totalDolar = 0;

    const modelsUse = Object
      .entries(uses || {});
    for (const [model, use] of modelsUse) {
      const costs = AiCallContext.getByModelCosts(model as AiModel, use || {});
      totalTokens += costs.tokens;
      totalDolar += costs.dolars;
    }
    return { tokens: totalTokens, dolars: totalDolar };
  }
}

export type AiModel = string;
export interface AIMessageProcessing {
  model?: AiModel;
  inputTokens?: number;
  outputTokens?: number;
  inputPrice?: number;
  outputPrice?: number;
  price?: number;
  processedAt?: Date | string;
}

export type AIHistoryMessage = ChatCompletionMessageParam & {
  processing?: AIMessageProcessing;
};

export type AIUses<T = number, Model extends string = AiModel> = {
  [model in Model]?: AIUse<T>;
};

export interface AIUse<T = number> extends ResourceUseNode<T> {
  input?: T;
  output?: T;
  requests?: T;
}
