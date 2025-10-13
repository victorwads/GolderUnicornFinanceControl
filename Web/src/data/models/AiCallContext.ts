import type { ChatCompletionMessageParam } from "openai/resources/index";
import type { ResourceUseNode } from "@resourceUse";

import { DocumentModel } from "./DocumentModel";
import { type Dolar, USD_TO_BRL } from "../constants/currency";

const MILION = 1000000;

export class AiCallContext extends DocumentModel {
  public static TOKEN_PRICES: AIUses<Dolar, AiModel> = {
    "gpt-5-nano": { input: 0.05, output: 0.4 },
    "gpt-5-mini": { input: 0.25, output: 2.0 },
    "gpt-4.1-nano": { input: 0.1, output: 0.4 },
    "gpt-4.1-mini": { input: 0.4, output: 1.6 },
    "openai/gpt-4.1-mini": { input: 0.4, output: 1.6 },
    "@preset/gu-daily-assistant": { input: 0.4, output: 0.8 }, // Similar to gpt-4.1-mini
  };

  constructor(
    public id: string,
    public model: string,
    public preset: string = model,
    public provider: string = "openai",
    public history: ChatCompletionMessageParam[] = [],
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

  public getCostBRL(): number {
    const tokens = this.tokens ?? { input: 0, output: 0 };
    const model = (this.model || "gpt-4.1-mini") as AiModel;
    const { dolars } = AiCallContext.getByModelCosts(model, tokens);
    return dolars * USD_TO_BRL;
  }

  public static getByModelCosts(model: AiModel, use: AIUse): {
    tokens: number;
    dolars: number;
  } {
    let totalTokens = 0, totalDolar = 0, input = use.input || 0, output = use.output || 0;
    const prices = (AiCallContext.TOKEN_PRICES[model] || { input: 0, output: 0 }) as AIUse<Dolar>;
    totalTokens += input + output;
    totalDolar += 
      ( input * ((prices.input || 0) / MILION) ) +
      ( output * ((prices.output || 0) / MILION) );
  
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
export type AIUses<T = number, Model extends string = AiModel> = {
  [model in Model]?: AIUse<T>;
};

export interface AIUse<T = number> extends ResourceUseNode<T> {
  input?: T;
  output?: T;
  requests?: T;
}
