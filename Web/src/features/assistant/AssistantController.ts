import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionFunctionTool,
  ChatCompletionMessage,
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources/index";

import { createOpenAIClient } from "./createOpenAIClient";
import { AssistantTools, DomainToolName, ToUserTool } from "./tools/AssistantTools";
import type {
  AssistantRunResult,
  AssistantToolCallLog,
} from "./tools/types";
import { addResourceUse, TOKEN_PRICES, type AiModel } from "@resourceUse";
import getRepositories, { Repositories } from "@repositories";
import { AiCallContext } from "@models";
import { Result } from "src/data/models/metadata";
import { AppNavigationTool } from "./tools/routesDefinition";

export let ASSISTANT_MODEL: AiModel = "gpt-4.1-nano";

const AIModelStorageKey = "assistant_model";
const savedModel = localStorage.getItem(AIModelStorageKey);
if (savedModel && Object.keys(TOKEN_PRICES).includes(savedModel)) {
  ASSISTANT_MODEL = savedModel as AiModel;
}

export function setAssistantModel(model: AiModel) {
  ASSISTANT_MODEL = model;
  localStorage.setItem(AIModelStorageKey, model);
  window.location.reload();
}

const SYSTEM_PROMPT = `
You are an personal finance management assistant app. Your role is to help the user manage their personal finances.
Always respond using registered tool calls, use them to accomplish your tasks.

Data management:
- You can manage user's data by "domain" using the ${DomainToolName.LIST_ALL}, ${DomainToolName.LIST_ACTIONS} tools when user wants to create/update/delete something.
- To obtain required model's values for toolcalls, you can use the ${ToUserTool.ASK} tool to ask the user for them if need. Avoid inferring import fields.
- For not required values, omit them if the user did not provide them.
- For identifier fields, use the ${DomainToolName.SEARCH_IN_DOMAIN} tool to find the ID of the record. You can use multiple ${DomainToolName.SEARCH_IN_DOMAIN} calls to find all required identifiers.
- Dates should be converted from relative formats like "today", "tomorrow", "last week", etc to absolute datetime in the format YYYY-MM-DDTHH:mm.

Navigation:
- User can ask to see something, use the ${AppNavigationTool.LIST_SCREENS} tool to search available screens.
- Every search term should be translated to English before calling ${AppNavigationTool.LIST_SCREENS}.
- Always try to set urlPathParams and queryParams when using ${AppNavigationTool.NAVIGATE}. Fill then according to user request and the screen you are navigating to.

Rules:
- When you finish all actions requested by the user, you should call the ${ToUserTool.FINISH} tool to end the session. Please confirm with the user that all actions were completed.
- Do not call ${ToUserTool.FINISH} before finishing all orchestration required by the user.
- Only talk with the user in his native language, which is provided in the first user message.
- Before you finish, you can optionally move to the screen about the action that you just did like view the "edit/view screen" of that domain.
`.trim();
// - The action_create_new tools can be used to create records, or if an ID is provided, update or delete it. The provided ID must be obtained via equivalent search_*.

export type ToolEventListener = (event: AssistantToolCallLog) => void;
export type AskAnditionalInfoCallback = (message: string) => Promise<string>;

export default class AssistantController {
  private readonly openai = createOpenAIClient();
  private readonly toolRegistry: AssistantTools = new AssistantTools(
    this.repositories
  );

  constructor(
    private readonly repositories: Repositories = getRepositories(),
    public onAskAnditionalInfo?: AskAnditionalInfoCallback,
    public onToolCalled?: ToolEventListener,
    public onNavigate?: (route: string, queryParams?: Record<string, string>) => void,
    public model: string = ASSISTANT_MODEL,
  ) {}

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
    try {
      while (run) {
        const toolSchema = this.toolRegistry.buildToolSchema();
        const completion = await this.requestCompletion(context.history, toolSchema);
        const choice = completion.choices[0];
        this.recordUsage(completion, context);

        if (!choice) { context.finishReason = "no_choice_returned"; break; }

        const toolCalls = this.appendAssistantResponse(choice.message, context)
          .filter(call => call?.type === "function")

        if (!toolCalls.length) {context.finishReason = "assistant_no_tool_calls"; break; }

        for (const call of toolCalls) {
          if (call.function.name === ToUserTool.FINISH) {
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

    return { warnings: context.warnings };
  }

  private createRunContext(text: string, userLanguage: string): AiCallContext {
    const context = new AiCallContext(
      new Date().toISOString().replace("T", " ").substring(0, 19),
      this.model,
      [
        { role: "system", content: SYSTEM_PROMPT },
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
    addResourceUse({ ai: { [ASSISTANT_MODEL]: { requests: 1 } } });
    return this.openai.chat.completions.create({
      model: ASSISTANT_MODEL,
      messages,
      tools,
      tool_choice: "required",
      parallel_tool_calls: true,
      ...(ASSISTANT_MODEL.includes("gpt-5")
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

    const { id, history, warnings, sharedDomains, tokens } = context;
    this.repositories.aiCalls.set({ id, history, warnings, sharedDomains, tokens }, true);
    return message.tool_calls || [];
  }

  private recordUsage(completion: {
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  }, context: AiCallContext) {
    const { prompt_tokens: input, completion_tokens: output } =
      completion.usage ?? {};
    if (!input && !output) return;

    context.tokens.input += input ?? 0;
    context.tokens.output += output ?? 0;
    addResourceUse({
      ai: {
        [ASSISTANT_MODEL]: {
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
        ?? { success: false, error: "No onAskAnditionalInfo handler provided." };
    } else {
      result = await this.toolRegistry.execute(name, args );
      context.sharedDomains = this.toolRegistry.sharedDomains;

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
