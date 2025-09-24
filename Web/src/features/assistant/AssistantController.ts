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
import { Result } from "src/data/models/metadata";
import { userInfo } from "os";

export const ASSISTANT_MODEL: AiModel = "gpt-4.1-mini";
const HISTORY_LIMIT = 15;

const SYSTEM_PROMPT = `
Você é o orquestrador do Golden Unicorn, um app de gestão financeira pessoal.
Sua função é ajudar o usuário a gerenciar suas finanças pessoais, utilizando as ferramentas (tools) disponíveis.
Siga exatamente estas regras:
- Responda sempre usando tools calls registradas.
- Utilize as tools disponíveis para obter ou registrar dados.
- As tools search_* podem ser chamadas múltiplas vezes para obter identificados ou refinar dados.
- As tools action_* finalizarão a conversa, então só as utilize quando estiver pronto para finalizar.
- Nunca produza valores que o usuário não disse explicitamente ou foram obtidos via search_*.
- Converta datas relativas como "hoje, amanhã, semana passada, etc. para datas absolutas.
- Qualquer data deve ser retornada no formato YYYY-MM-DDTHH:mm.
- Campos não informados devem ser omitidos se opcionais.
- Confirmações e solicitações de dados devem usar ask_aditional_info somente se estritamente necessário prefira sempre finalizar a conversa.
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
    while (run) {
      const completion = await this.requestCompletion(messages, toolSchema);
      this.recordUsage(completion);

      const choice = completion.choices[0];
      const toolCalls = this.appendAssistantResponse(choice.message, context);

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
            call.function.name.startsWith("action_") &&
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

    return {
      warnings: context.warnings,
    };
  }

  private createRunContext(text: string, userLanguage: string): RunContext {
    return {
      history: [
        {
          role: "user",
          content: `Idioma: ${userLanguage}\n${text} Data Hora Atual: ${new Date().toISOString()}`,
        },
      ],
      warnings: [],
    };
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

  private appendAssistantResponse(
    message: ChatCompletionMessage,
    context: RunContext
  ): ChatCompletionMessageToolCall[] {
    const assistantMessage: ChatCompletionAssistantMessageParam = {
      role: "assistant",
      content: message.content,
      tool_calls: message.tool_calls,
    };
    context.history.push(assistantMessage);

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

    context.history.push({
      role: "tool",
      tool_call_id: call.id,
      content: JSON.stringify(result ?? null),
    });

    return result;
  }
}

type RunContext = {
  history: ChatCompletionMessageParam[];
  warnings: string[];
};

function limitHistory(
  history: ChatCompletionMessageParam[]
): ChatCompletionMessageParam[] {
  if (history.length <= HISTORY_LIMIT) return history;
  return history.slice(history.length - HISTORY_LIMIT);
}
