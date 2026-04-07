import { OpenAI } from "openai";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionFunctionTool,
  ChatCompletionMessage,
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionToolMessageParam,
} from "openai/resources/index";

import { ProjectStorage } from '@utils/ProjectStorage';
import getRepositories, { Repositories } from "@repositories";
import { AiCallContext, type AiModel, type AIHistoryMessage, type AIMessageProcessing } from "@models";
import { addResourceUse } from "@resourceUse";

import { clearOpenRouterSessionCache, createOpenAIClient } from "./createOpenAIClient";
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

export const DEFAULT_ASSISTANT_MODEL: AiModel = "gpt-5.4-nano";
const DEFAULT_ONBOARDING_MODEL: AiModel = "gpt-5.4-mini";

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
export type OnboardingModeListener = (isOnboarding: boolean) => void;

type PendingToolCall = {
  id: string;
  name: string;
};

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
    public onOnboardingModeChanged?: OnboardingModeListener,
    public model: string = getAssistantModel(),
    private readonly repositories: Repositories = getRepositories(),
  ) {

    this.repositories.user.getUserData().then(user => {
      this.setPrompt(!user.onboardingDone)
    })
  }

  private setPrompt(onboarding: boolean) {
    this.model = onboarding ? DEFAULT_ONBOARDING_MODEL : getAssistantModel();
    this.toolRegistry.setOnboarding(onboarding);
    this.onOnboardingModeChanged?.(onboarding);
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
        const onlyStateToUser = toolCalls.every((call) => call.function.name === ToUserTool.STATE);

        for (const call of toolCalls) {
          if (call.function.name === ToUserTool.FINISH || call.function.name === ToUserTool.FINISH_ONBOARDING) {
            const args = call.function.arguments
              ? JSON.parse(call.function.arguments)
              : {};

            this.onToolCalled?.({
              id: call.id,
              name: call.function.name,
              arguments: args,
              result: null,
              executedAt: Date.now(),
            }, context);

            const result: Result<string> = {
              success: true,
              result: call.function.name === ToUserTool.FINISH_ONBOARDING
                ? "Onboarding finished."
                : "Conversation finished.",
            };

            context.finishReason = "finished_by_assistant";
            run = false;
            if (call.function.name === ToUserTool.FINISH_ONBOARDING) {
              this.toolRegistry.setOnboarding(false);
              await this.repositories.user.updateUserData({ onboardingDone: true });
              context.finishReason += "_onboarding";
            }

            this.onToolCalled?.({
              id: call.id,
              name: call.function.name,
              arguments: args,
              result,
              executedAt: Date.now(),
            }, context);

            this.appendToolResult(call.id, result, context);
          } else {
            await this.executeToolCall(call, context);
          }
        }

        if (run && onlyStateToUser) {
          context.finishReason = "assistant_waiting_next_message";
          break;
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
    const pending = pendingContext.context;
    if (pending) {
      pendingContext.context = null;
      return this.initFromPendingContext(pending, text);
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

  private initFromPendingContext(context: AiCallContext, text: string): AiCallContext {
    const pendingToolCalls = this.getPendingToolCalls(context);
    pendingToolCalls.forEach((call) => {
      const result: Result<unknown> = isBlockingAskTool(call.name)
        ? { success: true, result: text }
        : { success: false, errors: "Call this tool again." };

      context.history.push(
        this.enrichHistoryMessage(
          {
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(result),
          },
          context.model || this.model
        )
      );
    });

    if (pendingToolCalls.length === 0) {
      context.history.push(
        this.enrichHistoryMessage({ role: "user", content: text }, this.model)
      );
    }

    this.onContextChanged?.(context);
    return context;
  }

  private getPendingToolCalls(context: AiCallContext): PendingToolCall[] {
    const pending = new Map<string, PendingToolCall>();
    const history = context.history as (
      ChatCompletionAssistantMessageParam|ChatCompletionToolMessageParam
    )[];

    history.forEach((entry) => {
      if (entry.role === "assistant" && Array.isArray(entry.tool_calls)) {
        entry.tool_calls.forEach((toolCall) => {
          if (toolCall?.type !== "function" || !toolCall.id || !toolCall.function?.name) return;

          const { id, function: { name } } = toolCall;
          pending.set(id, { id, name});
        });
      } else if (entry.role === "tool") {
        pending.delete(entry.tool_call_id);
      }
    });

    return Array.from(pending.values());
  }

  private async requestCompletion(
    messages: ChatCompletionMessageParam[],
    tools: ChatCompletionFunctionTool[]
  ) {
    addResourceUse({ ai: { [this.model]: { requests: 1 } } });
    const openai = await this.getOpenAIClient();
    try {
      return await openai.chat.completions.create({
        model: this.model,
        messages,
        tools,
        tool_choice: "required",
        parallel_tool_calls: true,
        ...(this.model.includes("gpt-5")
          ? { reasoning_effort: "none" }
          : { temperature: 0.1 }),
      });
    } catch (error) {
      this.handleCompletionError(error);
      throw error;
    }
  }

  private handleCompletionError(error: unknown) {
    logger.error("requestCompletion:error", { error });
    this.openai = null;
    clearOpenRouterSessionCache();

    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(`${ProjectStorage.PREFIX}crypto.`))
      .forEach((key) => sessionStorage.removeItem(key));
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

  private appendToolResult(toolCallId: string, result: Result<unknown>, context: AiCallContext) {
    const toolMessage: ChatCompletionMessageParam = {
      role: "tool",
      tool_call_id: toolCallId,
      content: JSON.stringify(result ?? null),
    };

    context.history.push(this.enrichHistoryMessage(toolMessage, context.model || this.model));
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
    if (isBlockingAskTool(call.function.name)) {
      result = await this.onAskAnditionalInfo?.(args.message)
        .then((response) => ({ success: true, result: response }))
        ?? { success: false, errors: "No onAskAnditionalInfo handler provided." };
    } else if (call.function.name === ToUserTool.STATE) {
      result = { success: true, result: args.message };
    } else {
      result = await this.toolRegistry.execute(name, args );
      context.sharedDomains = Array.from(this.toolRegistry.sharedDomains);

      if(name === AppNavigationTool.NAVIGATE && result.success === true) {
        const { url } = args as { url: string };
        this.onNavigate?.(typeof result.result === "string" ? result.result : url);
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

    this.appendToolResult(call.id, result, context);
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

function isBlockingAskTool(toolName: string) {
  return toolName === ToUserTool.ASK || toolName === ToUserTool.LEGACY_SAY;
}
