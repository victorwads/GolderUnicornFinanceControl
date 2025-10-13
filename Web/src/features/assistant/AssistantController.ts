import { OpenAI } from "openai";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionFunctionTool,
  ChatCompletionMessage,
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources/index";

import getRepositories, { Repositories } from "@repositories";
import { AiCallContext, type AiModel } from "@models";
import { addResourceUse } from "@resourceUse";

import { createOpenAIClient } from "./createOpenAIClient";
import { AssistantTools } from "./tools/AssistantToolsDefinition";
import type {
  AssistantRunResult,
  AssistantLimitResult,
  AssistantToolCallLog,
} from "./tools/types";

import {
  ensureMonthlyLimit,
  MONTHLY_LIMIT_REACHED_MESSAGE,
} from "./costControl";
import { Result } from "src/data/models/metadata";
import { AppNavigationTool } from "./tools/routesDefinition";
import AssistantGeneralPrompt from "./AssistantGeneral.prompt";
import AssistantOnboardingPrompt from "./AssistantOnboarding.prompt";
import { ToUserTool } from "./tools/AssistantToolsBase";

export const DEFAULT_ASSISTANT_MODEL: AiModel = "gpt-4.1-nano"; // "@preset/gu-daily-assistant";

const AIModelStorageKey = "assistant_model";

export const getAssistantModel = (): AiModel => {
  const savedModel = localStorage.getItem(AIModelStorageKey);
  if (savedModel && Object.keys(AiCallContext.TOKEN_PRICES).includes(savedModel)) {
    return savedModel as AiModel;
  }
  return DEFAULT_ASSISTANT_MODEL;
}

export function setAssistantModel(model: AiModel) {
  localStorage.setItem(AIModelStorageKey, model);
  window.location.reload();
}

export type ToolEventListener = (event: AssistantToolCallLog) => void;
export type AskAnditionalInfoCallback = (message: string) => Promise<string>;

export default class AssistantController {
  private openai: OpenAI | null = null;
  private inOnboarding: boolean = false;
 
  private readonly toolRegistry: AssistantTools = new AssistantTools(
    this.repositories
  );

  constructor(
    public onAskAnditionalInfo?: AskAnditionalInfoCallback,
    public onToolCalled?: ToolEventListener,
    public onNavigate?: (route: string, queryParams?: Record<string, string>) => void,
    public model: string = getAssistantModel(),
    private readonly repositories: Repositories = getRepositories(),
  ) {

    this.repositories.user.getUserData().then(user => {
      this.setPrompt(!user.onboardingDone)
    })
  }

  private setPrompt(onboarding: boolean) {
    this.model = onboarding ? "gpt-4.1-mini" : getAssistantModel();
    this.inOnboarding = onboarding;
  }

  private async getOpenAIClient(): Promise<OpenAI> {
    if (!this.openai) {
      this.openai = await createOpenAIClient();
    }
    return this.openai;
  }

  async run(text: string, userLanguage: string): Promise<AssistantRunResult> {
    const context = this.createRunContext(text, userLanguage);

    this.onToolCalled?.({
      id: "user-message",
      name: "user_message",
      arguments: { text },
      result: null,
      executedAt: Date.now(),
    });

    let run = true;
    let limitResult: AssistantLimitResult | undefined;
    try {
      while (run) {
        const { allowed } = await ensureMonthlyLimit(this.repositories);
        if (!allowed) {
          limitResult = { success: false, result: MONTHLY_LIMIT_REACHED_MESSAGE };
          context.finishReason = "blocked_by_monthly_limit";
          context.warnings.push(MONTHLY_LIMIT_REACHED_MESSAGE);
          break;
        }

        const toolSchema = this.toolRegistry.buildToolSchema();
        const completion = await this.requestCompletion(context.history, toolSchema);
        const choice = completion.choices[0];
        this.recordUsage(completion, context);
        context.model = completion.model || context.model || this.model;
        context.provider = (completion as any).provider || "OpenRouter";

        if (!choice) { context.finishReason = "no_choice_returned"; break; }

        const toolCalls = this.appendAssistantResponse(choice.message, context)
          .filter(call => call?.type === "function")

        if (!toolCalls.length) {context.finishReason = "assistant_no_tool_calls"; break; }

        for (const call of toolCalls) {
          if (call.function.name === ToUserTool.FINISH) {
            if (this.inOnboarding) {
              this.inOnboarding = false;
              await this.repositories.user.updateUserData({ onboardingDone: true });
            }
            context.finishReason = "finished_by_assistant"; run = false;
          } else {
            await this.executeToolCall(call, context);
          }
        }
      }
    } catch (error) {
      context.warnings.push(`internal_error: ${error}`);
    } finally {
      context.finishedAt = new Date();
      await this.persistAiCall(context);
    }

    return { warnings: context.warnings, limitResult };
  }

  private createRunContext(text: string, userLanguage: string): AiCallContext {
    if (pendingContext.context) {
      const { context} = pendingContext;
      pendingContext.context = null;
      context.history.push(
        { role: "user", content: text }
      );
      return context;
    }

    const context = new AiCallContext(
      new Date().toISOString().replace("T", " ").substring(0, 19),
      this.model,
      this.model,
      "OpenRouter",
      [
        { role: "system", content: this.inOnboarding ? AssistantOnboardingPrompt : AssistantGeneralPrompt },
        {
          role: "user",
          content: `User native language: ${userLanguage}\nCurrent DateTime: ${new Date().toISOString()}`,
        },
        { role: "user", content: text }
      ],
    );
    this.repositories.aiCalls.set(context);
    return context;
  }

  private async requestCompletion(
    messages: ChatCompletionMessageParam[],
    tools: ChatCompletionFunctionTool[]
  ) {
    addResourceUse({ ai: { [this.model]: { requests: 1 } } });
    const openai = await this.getOpenAIClient();
    return openai.chat.completions.create({
      model: this.model,
      messages,
      tools,
      tool_choice: "required",
      parallel_tool_calls: true,
      ...(this.model.includes("gpt-5")
        ? { reasoning_effort: "low" }
        : { temperature: 0.1 }),
    });
  }

  private appendAssistantResponse(message: ChatCompletionMessage, context: AiCallContext): ChatCompletionMessageToolCall[] {
    const assistantMessage: ChatCompletionAssistantMessageParam = {
      role: "assistant",
      content: message.content,
      tool_calls: message.tool_calls,
    };
    context.history.push(assistantMessage);
    if (message.content && message.content.trim().length > 0) {
      context.warnings.push("model_return_plain_text");
    }

    const { id, history, warnings, sharedDomains, tokens, model } = context;
    this.repositories.aiCalls.set({ id, history, warnings, sharedDomains, tokens, model }, true);
    return message.tool_calls || [];
  }

  private recordUsage(completion: {
    model?: string;
    usage?: { prompt_tokens?: number; completion_tokens?: number};
  }, context: AiCallContext) {
    const { prompt_tokens: input, completion_tokens: output } =
      completion.usage ?? {};
    if (!input && !output) return;

    context.tokens.input += input ?? 0;
    context.tokens.output += output ?? 0;
    addResourceUse({
      ai: {
        [completion.model || this.model]: {
          input,
          output,
        },
      },
    });
  }

  private async persistAiCall(context: AiCallContext): Promise<void> {
    await this.repositories.aiCalls.set(context);
  }

  private async executeToolCall(
    call: ChatCompletionMessageFunctionToolCall,
    context: AiCallContext
  ): Promise<unknown> {
    const args = call.function.arguments
      ? JSON.parse(call.function.arguments)
      : {};

    const name = call.function.name;
    const userInfo = this.toolRegistry.getToolUserInfo(name, args);

    this.onToolCalled?.({
      id: call.id,
      name,
      arguments: args,
      result: null,
      userInfo,
      executedAt: Date.now(),
    });

    let result: Result<unknown>;
    if (call.function.name === ToUserTool.ASK) {
      result = await this.onAskAnditionalInfo?.(args.message)
        .then((response) => ({ success: true, result: response }))
        ?? { success: false, errors: "No onAskAnditionalInfo handler provided." };
    } else {
      result = await this.toolRegistry.execute(name, args );
      context.sharedDomains = Array.from(this.toolRegistry.sharedDomains);

      if(name === AppNavigationTool.NAVIGATE && result.success === true) {
        const { route, queryParams } = args as { route: string, queryParams?: Record<string, string> };
        this.onNavigate?.(route, queryParams);
      }
    }

    let resultInfo = undefined;
    if(result.success === true) {
      resultInfo = this.toolRegistry.getToolUserInfo(name, args, result.result);
    }

    this.onToolCalled?.({
      id: call.id,
      name,
      arguments: args,
      result,
      userInfo: resultInfo,
      executedAt: Date.now(),
    });

    const toolMessage: ChatCompletionMessageParam = {
      role: "tool",
      tool_call_id: call.id,
      content: JSON.stringify(result ?? null),
    };
    context.history.push(toolMessage);

    return result;
  }
}

const pendingContext: {
  context: AiCallContext | null;
} = {
  context: null,
}

export const setPendingAiContext = (context: AiCallContext) => {
  pendingContext.context = context;
}

