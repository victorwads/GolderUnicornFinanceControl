import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionFunctionTool,
  ChatCompletionMessage,
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources/index";

import { createOpenAIClient } from "./createOpenAIClient";
import { AppActionTool, AssistantTools, DomainToolName, ToUserTool } from "./tools/AssistantTools";
import type {
  AssistantRunResult,
  AssistantToolCallLog,
} from "./tools/types";
import { addResourceUse, type AiModel } from "@resourceUse";
import getRepositories, { Repositories } from "@repositories";
import { AiCallContext } from "@models";
import { Result } from "src/data/models/metadata";

export const ASSISTANT_MODEL: AiModel = "gpt-4.1-mini";
const HISTORY_LIMIT = 50;

const SYSTEM_PROMPT = `
You are an personal finance management assistant app. Your role is to help the user manage their personal finances.
Use the tools provided by the system to accomplish your tasks. Follow exactly these rules:
- Always respond using registered tool calls.
- The apps is divided in domains, use ${DomainToolName.LIST_ALL} to obtain the list of domain names.
- Each domain has its own data that can be managed. Call ${DomainToolName.LIST_ACTIONS} to get the domain tools.
- To obtain required values for toolcalls, use the ${ToUserTool.ASK} tool to ask the user for them. Avoid inferring them.
- For not required values, omit them if the user did not provide them.
- For identifier fields, use the ${DomainToolName.SEARCH_IN_DOMAIN} tool to find the ID of the record. You can use multiple ${DomainToolName.SEARCH} calls to find all required identifiers.
- Dates should be converted from relative formats like "today", "tomorrow", "last week", etc to absolute datetime in the format YYYY-MM-DDTHH:mm.
- When you finish all actions requested by the user, you should call the ${ToUserTool.FINISH} tool to end the session. Please confirm with the user that all actions were completed.
- Before you finish, you can move to the screen about the action that you just did using the ${AppActionTool.NAVIGATE} tool.
- Do not call ${ToUserTool.FINISH} before finishing all orchestration required by the user.
- Only talk with the user in his native language, which is provided in the first user message.
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
    let messages = this.buildMessages(context.history);

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
        const completion = await this.requestCompletion(messages, toolSchema);
        const choice = completion.choices[0];
        this.recordUsage(completion, context);

        if (!choice) { context.finishReason = "no_choice_returned"; break;}

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
        messages = this.buildMessages(context.history);
        context.history = limitHistory(context.history);
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

  private buildMessages(
    history: ChatCompletionMessageParam[]
  ): ChatCompletionMessageParam[] {
    return [{ role: "system", content: SYSTEM_PROMPT }, ...history];
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

      if(name === AppActionTool.NAVIGATE && result.success === true) {
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

function limitHistory(
  history: ChatCompletionMessageParam[]
): ChatCompletionMessageParam[] {
  if (history.length <= HISTORY_LIMIT) return history;
  return history.slice(history.length - HISTORY_LIMIT);
}
