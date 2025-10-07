import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionFunctionTool,
  ChatCompletionMessage,
  ChatCompletionMessageFunctionToolCall,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources/index";

import { createOpenAIClient } from "./createOpenAIClient";
import { AssistantTools } from "./tools/AssistantTools";
import type {
  AssistantRunResult,
  AssistantToolCallLog,
  AssistantToolName,
} from "./tools/types";
import { addResourceUse, type AiModel } from "@resourceUse";
import getRepositories, { Repositories } from "@repositories";
import { AiCall } from "@models";
import { Result } from "src/data/models/metadata";

export const ASSISTANT_MODEL: AiModel = "gpt-4.1-mini";
const HISTORY_LIMIT = 40;

const SYSTEM_PROMPT = `
You are the orchestrator of Golden Unicorn, a personal finance management app.
Your role is to help the user manage their personal finances using the available tools.
Follow exactly these rules:
- Always respond using registered tool calls.
- NEVER make up IDs or any values that the user did not provide. If required values are missing, use the ask_aditional_info tool to ask the user for them. If not required, omit them.
- The search_* tools can be called multiple times to obtain identifiers of data.
- The action_create_* tools can be used to create records, or if an ID is provided, update or delete it. The provided ID must be obtained via equivalent search_*.
- Dates should be converted from relative formats like "today", "tomorrow", "last week", etc. to absolute dates.
- Any date must be returned in the format YYYY-MM-DDTHH:mm.
- When you finish all actions requested by the user, you MUST call the close_context tool to end the session and reset the context. Never keep the context open after the user's request is completed.
- Only call close_context when you are sure all dependent actions are done (e.g., do this and that and etc..).
- Do not call close_context before finishing all orchestration required by the user.
`.trim();

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
    public onNavigate?: (route: string, queryParams?: Record<string, string>) => void
  ) {}

  async run(text: string, userLanguage: string): Promise<AssistantRunResult> {
    const context = this.createRunContext(text, userLanguage);
    const toolSchema = this.toolRegistry.buildToolSchema();

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
        const completion = await this.requestCompletion(messages, toolSchema);
        this.recordUsage(completion);

        const choice = completion.choices[0];

        if (!choice) {
          this.trackLog(
            context,
            this.createLogEntry("assistant", {
              error: "Completion returned no choices",
              completionId: completion.id,
              model: completion.model,
              requestMessages: messages,
            })
          );
          break;
        }

        const toolCalls = this.appendAssistantResponse(choice.message, context, {
          completionId: completion.id,
          finishReason: choice.finish_reason ?? null,
          index: choice.index,
          usage: completion.usage,
          model: completion.model,
          created: completion.created,
          requestMessages: messages,
        });

        if (!toolCalls.length) {
          break;
        }

        for (const call of toolCalls) {
          if ("function" in call) {
            const result = (await this.executeToolCall(
              call,
              context
            )) as Result<unknown>;
            if (
              call.function.name.startsWith("close_context") &&
              "success" in result &&
              result.success === true
            ) {
              run = false;
            }
          }
        }
        messages = this.buildMessages(context.history);
        context.history = limitHistory(context.history);
      }
    } finally {
      await this.persistAiCall(context);
    }

    return {
      warnings: context.warnings,
    };
  }

  private createRunContext(text: string, userLanguage: string): RunContext {
    const messageTimestamp = new Date();
    const userMessage: ChatCompletionMessageParam = {
      role: "user",
      content: `Idioma: ${userLanguage}\n${text} Data Hora Atual: ${messageTimestamp.toISOString()}`,
    };

    return {
      history: [userMessage],
      warnings: [],
      log: [
        this.createLogEntry("system", { content: SYSTEM_PROMPT }),
        this.createLogEntry(
          "user",
          {
            language: userLanguage,
            text,
            message: userMessage,
          },
          messageTimestamp
        ),
      ],
    };
  }

  private buildMessages(
    history: ChatCompletionMessageParam[]
  ): ChatCompletionMessageParam[] {
    return [{ role: "system", content: SYSTEM_PROMPT }, ...history];
  }

  private createLogEntry(
    role: ChatCompletionMessageParam["role"],
    data: Record<string, unknown>,
    timestamp: Date = new Date()
  ): AiCallLogEntry {
    return {
      role,
      timestamp: timestamp.toISOString(),
      data,
    };
  }

  private trackLog(context: RunContext, entry: AiCallLogEntry): void {
    context.log.push(entry);
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

  private appendAssistantResponse(
    message: ChatCompletionMessage,
    context: RunContext,
    metadata?: AssistantMessageMetadata
  ): ChatCompletionMessageToolCall[] {
    const assistantMessage: ChatCompletionAssistantMessageParam = {
      role: "assistant",
      content: message.content,
      tool_calls: message.tool_calls,
    };
    context.history.push(assistantMessage);

    const logPayload: Record<string, unknown> = {
      assistantMessage,
      rawMessage: message,
    };

    if (metadata) {
      Object.assign(logPayload, metadata);
    }

    this.trackLog(context, this.createLogEntry("assistant", logPayload));

    if (message.content && message.content.trim().length > 0) {
      context.warnings.push("O modelo tentou responder com texto livre.");
    }

    return message.tool_calls || [];
  }

  private recordUsage(completion: {
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  }) {
    const { prompt_tokens: input, completion_tokens: output } =
      completion.usage ?? {};
    if (!input && !output) return;

    addResourceUse({
      ai: {
        [ASSISTANT_MODEL]: {
          input,
          output,
        },
      },
    });
  }

  private async persistAiCall(context: RunContext): Promise<void> {
    try {
      const aiCall = new AiCall(
        new Date().toISOString().replace(/:/g, ""),
        context.log as object[]
      );
      await this.repositories.aiCalls.set(aiCall);
    } catch (error) {
      console.error("Failed to persist AI call log", error);
    }
  }

  private async executeToolCall(
    call: ChatCompletionMessageFunctionToolCall,
    context: RunContext
  ): Promise<unknown> {
    const args = call.function.arguments
      ? JSON.parse(call.function.arguments)
      : {};

    const name = call.function.name as AssistantToolName;
    const userInfo = this.toolRegistry.getToolUserInfo(name, args);

    this.onToolCalled?.({
      id: call.id,
      name,
      arguments: args,
      result: null,
      userInfo,
      executedAt: Date.now(),
    });

    let result;
    if (call.function.name === "ask_aditional_info") {
      result = await this.onAskAnditionalInfo?.(args.message);
    } else {
      result = await this.toolRegistry.execute(
        name,
        args,
        { id: call.id }
      ) as Result<unknown>;

      if(name === "action_navigate_to_screen" && result.success === true) {
        const { route, queryParams } = args as { route: string, queryParams?: Record<string, string> };
        this.onNavigate?.(route, queryParams);
      }
    }

    let resultInfo = undefined;
    if(name.startsWith("action_create_") && result.success === true) {
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

    this.trackLog(
      context,
      this.createLogEntry("tool", {
        callId: call.id,
        name,
        arguments: args,
        result: result ?? null,
        toolCall: {
          id: call.id,
          type: (call as ChatCompletionMessageToolCall).type,
          function: call.function,
        },
        toolMessage,
        userInfo,
        resultInfo,
      })
    );

    return result;
  }
}

type RunContext = {
  history: ChatCompletionMessageParam[];
  warnings: string[];
  log: AiCallLogEntry[];
};

type AiCallLogEntry = {
  role: ChatCompletionMessageParam["role"];
  timestamp: string;
  data: Record<string, unknown>;
};

type AssistantMessageMetadata = {
  completionId?: string;
  finishReason?: string | null;
  index?: number;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  model?: string;
  created?: number;
  requestMessages?: ChatCompletionMessageParam[];
};

function limitHistory(
  history: ChatCompletionMessageParam[]
): ChatCompletionMessageParam[] {
  if (history.length <= HISTORY_LIMIT) return history;
  return history.slice(history.length - HISTORY_LIMIT);
}
