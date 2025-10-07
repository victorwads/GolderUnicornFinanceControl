import { ChatCompletionMessageParam } from "openai/resources/index";
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
    }
  ) {
    super(id);
  }
}
