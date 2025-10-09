import { ChatCompletionMessageParam } from "openai/resources/index";
import { getByModelCosts, type AiModel } from "@resourceUse";
import { USD_TO_BRL } from "../constants/currency";
import { DocumentModel } from "./DocumentModel";

export class AiCallContext extends DocumentModel {
  constructor(
    public id: string,
    public model: string,
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
    const { dolars } = getByModelCosts(model, tokens);
    return dolars * USD_TO_BRL;
  }
}
