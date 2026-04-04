import { OpenAI } from "openai";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionFunctionTool,
  ChatCompletionMessage,
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources/index";

import { ProjectStorage } from '@utils/ProjectStorage';
import getRepositories, { Repositories } from "@repositories";
import { AiCallContext, type AiModel, type AIHistoryMessage, type AIMessageProcessing } from "@models";
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
import { createLogger } from "@utils/logger";

const logger = createLogger("assistant");

export const DEFAULT_ASSISTANT_MODEL: AiModel = "gpt-4.1-nano"; // "@preset/gu-daily-assistant";

const AIModelStorageKey = "assistant_model";

export const getAssistantModel = (): AiModel => {
  const savedModel = ProjectStorage.get(AIModelStorageKey);
  if (savedModel && AiCallContext.PriceModels.includes(savedModel)) {
    return savedModel as AiModel;
  }
  return DEFAULT_ASSISTANT_MODEL;
}

export function setAssistantModel(model: AiModel) {
  ProjectStorage.set(AIModelStorageKey, model);
  window.location.reload();
}

export type ToolEventListener = (event: AssistantToolCallLog, context: AiCallContext) => void;
export type AskAnditionalInfoCallback = (message: string) => Promise<string>;

export default class AssistantController {
  private openai: OpenAI | null = null;
 
  private readonly toolRegistry: AssistantTools = new AssistantTools(
    this.repositories,
  );

  constructor(
    public onAskAnditionalInfo?: AskAnditionalInfoCallback,
    public onToolCalled?: ToolEventListener,
    public onNavigate?: (route: string, queryParams?: Record<string, string>) => void,
    public onContextChanged?: (context: AiCallContext) => void,
    public model: string = getAssistantModel(),
    private readonly repositories: Repositories = getRepositories(),
  ) {

    this.repositories.user.getUserData().then(user => {
      this.setPrompt(!user.onboardingDone)
    })
  }

  private setPrompt(onboarding: boolean) {
    this.model = onboarding ? "gpt-4.1-mini" : getAssistantModel();
    this.toolRegistry.isOnboarding = onboarding;
  }

  private buildMessageProcessing(model: string, usage?: { input?: number; output?: number }): AIMessageProcessing {
    const resolvedModel = (model || this.model) as AiModel;
    const inputTokens = usage?.input ?? 0;
    const outputTokens = usage?.output ?? 0;
    const pricing = AiCallContext.getModelPricing(resolvedModel);
    const inputPrice = pricing ? (inputTokens * (pricing.input / 1000000)) : 0;
    const outputPrice = pricing ? (outputTokens * (pricing.output / 1000000)) : 0;

    return {
      model: resolvedModel,
      inputTokens,
      outputTokens,
      inputPrice,
      outputPrice,
      processedAt: new Date().toISOString(),
    };
  }

  private enrichHistoryMessage<T extends ChatCompletionMessageParam>(
    message: T,
    model: string,
    usage?: { input?: number; output?: number }
  ): AIHistoryMessage {
    return {
      ...message,
      processing: this.buildMessageProcessing(model, usage),
    };
  }

  private async getOpenAIClient(): Promise<OpenAI> {
    if (!this.openai) {
      this.openai = await createOpenAIClient();
    }
    return this.openai;
  }

  async run(text: string, userLanguage: string): Promise<AssistantRunResult> {
    const context = this.createRunContext(text, userLanguage);
    logger.debug("run:start", { contextId: context.id, text, userLanguage, model: this.model });

    this.onToolCalled?.({
      id: "user-message",
      name: "user_message",
      arguments: { text },
      result: null,
      executedAt: Date.now(),
    }, context);

    let run = true;
    let limitResult: AssistantLimitResult | undefined;
    try {
      while (run) {
        logger.debug("run:loop", {
          contextId: context.id,
          historyLength: context.history.length,
          currentModel: this.model,
        });
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
        logger.debug("run:completion", {
          contextId: context.id,
          choiceCount: completion.choices?.length ?? 0,
          completionModel: completion.model,
        });
        const usage = this.recordUsage(completion, context);
        context.model = completion.model || context.model || this.model;
        context.provider = (completion as any).provider || "OpenRouter";

        if (!choice) { context.finishReason = "no_choice_returned"; break; }

        const toolCalls = this.appendAssistantResponse(
          choice.message,
          context,
          toolSchema.map(t => t.function.name),
          usage
        )
          .filter(call => call?.type === "function")
        logger.debug("run:toolCalls", {
          contextId: context.id,
          toolCalls: toolCalls.map(call => call.function.name),
          hasAssistantContent: Boolean(choice.message?.content),
        });

        if (!toolCalls.length) {context.finishReason = "assistant_no_tool_calls"; break; }

        for (const call of toolCalls) {
          if (call.function.name === ToUserTool.FINISH || call.function.name === ToUserTool.FINISH_ONBOARDING) {
            context.finishReason = "finished_by_assistant";
            run = false;
            if (call.function.name === ToUserTool.FINISH_ONBOARDING) {
              this.toolRegistry.isOnboarding = false;
              await this.repositories.user.updateUserData({ onboardingDone: true });
              context.finishReason += "_onboarding";
            }
          } else {
            await this.executeToolCall(call, context);
          }
        }
      }
    } catch (error) {
      logger.error("run:error", { contextId: context.id, error });
      context.warnings.push(`internal_error: ${error}`);
    } finally {
      context.finishedAt = new Date();
      logger.debug("run:finally", {
        contextId: context.id,
        finishReason: context.finishReason,
        warnings: context.warnings,
        historyLength: context.history.length,
      });
      await this.persistAiCall(context);
    }

    return { warnings: context.warnings, limitResult };
  }

  private createRunContext(text: string, userLanguage: string): AiCallContext {
    if (pendingContext.context) {
      const { context} = pendingContext;
      pendingContext.context = null;
      context.history.push(
        this.enrichHistoryMessage({ role: "user", content: text }, this.model)
      );
      this.onContextChanged?.(context);
      return context;
    }

    const context = new AiCallContext(
      new Date().toISOString().replace("T", " ").substring(0, 19),
      this.model,
      this.model,
      "OpenRouter",
      [
        this.enrichHistoryMessage(
          { role: "system", content: this.toolRegistry.isOnboarding ? AssistantOnboardingPrompt : AssistantGeneralPrompt },
          this.model
        ),
        this.enrichHistoryMessage({
          role: "user",
          content: `User native language: ${userLanguage}\nCurrent DateTime: ${new Date().toISOString()}`,
        }, this.model),
        this.enrichHistoryMessage({ role: "user", content: text }, this.model)
      ],
    );
    this.persistAiCall(context);
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
        ? { reasoning_effort: "none" }
        : { temperature: 0.1 }),
    });
  }

  private appendAssistantResponse(
    message: ChatCompletionMessage,
    context: AiCallContext,
    toolNames: string[],
    usage?: { model: string; input?: number; output?: number }
  ): ChatCompletionMessageToolCall[] {
    const assistantMessage: ChatCompletionAssistantMessageParam & {available_tools: string[]} = {
      role: "assistant",
      content: message.content,
      available_tools: toolNames,
      tool_calls: message.tool_calls,
    };
    context.history.push(
      this.enrichHistoryMessage(
        assistantMessage,
        usage?.model || context.model || this.model,
        { input: usage?.input, output: usage?.output }
      )
    );
    if (message.content && message.content.trim().length > 0) {
      context.warnings.push("model_return_plain_text");
    }

    const { id, history, warnings, sharedDomains, tokens, model } = context;
    this.repositories.aiCalls.set({ id, history, warnings, sharedDomains, tokens, model }, true);
    this.onContextChanged?.(context);
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

    return {
      model: completion.model || this.model,
      input,
      output,
    };
  }

  private async persistAiCall(context: AiCallContext): Promise<void> {
    logger.debug("persistAiCall", {
      contextId: context.id,
      finishReason: context.finishReason,
      historyLength: context.history.length,
    });
    await this.repositories.aiCalls.set(context);
    this.onContextChanged?.(context);
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
    }, context);

    let result: Result<unknown>;
    logger.debug("executeToolCall:start", {
      contextId: context.id,
      tool: call.function.name,
      callId: call.id,
      args,
    });
    if (call.function.name === ToUserTool.SAY) {
      result = await this.onAskAnditionalInfo?.(args.message)
        .then((response) => ({ success: true, result: response }))
        ?? { success: false, errors: "No onAskAnditionalInfo handler provided." };
    } else {
      result = await this.toolRegistry.execute(name, args );
      context.sharedDomains = Array.from(this.toolRegistry.sharedDomains);

      if(name === AppNavigationTool.NAVIGATE && result.success === true) {
        const { url, queryParams } = args as { url: string, queryParams?: Record<string, string> };
        this.onNavigate?.(url, queryParams);
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
    }, context);

    const toolMessage: ChatCompletionMessageParam = {
      role: "tool",
      tool_call_id: call.id,
      content: JSON.stringify(result ?? null),
    };
    context.history.push(this.enrichHistoryMessage(toolMessage, context.model || this.model));
    logger.debug("executeToolCall:done", {
      contextId: context.id,
      tool: call.function.name,
      callId: call.id,
      resultSuccess: result?.success,
    });

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
