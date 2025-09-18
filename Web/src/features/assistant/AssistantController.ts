import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionFunctionTool,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionToolMessageParam,
} from 'openai/resources/index';

import { createOpenAIClient } from './createOpenAIClient';
import { AssistantTools } from './tools';
import type {
  AssistantRunResult,
  AssistantToolCallLog,
  AssistantToolName,
  AskUserPayload,
} from './types';
import { addResourceUse, type AiModel } from '@resourceUse';
import getRepositories, { Repositories } from '@repositories';

const MODEL: AiModel = 'gpt-4.1-mini';
const MAX_ITERATIONS = 4;
const HISTORY_LIMIT = 14;

const SYSTEM_PROMPT = `
Você é o orquestrador do Golden Unicorn.
Siga exatamente estas regras:
- Nunca produza texto livre; responda sempre usando tool calls registradas.
- Utilize as tools disponíveis para obter ou registrar dados.
- Antes de qualquer transferência, execute search_accounts para origem e destino; se faltar dado, use ask_user.
- Lançamento em conta: search_accounts e opcionalmente search_categories antes de create_account_entry.
- Lançamento em cartão: search_credit_cards e opcionalmente search_categories antes de create_creditcard_entry.
- Converta datas relativas como "hoje" para YYYY-MM-DD nos argumentos enviados às tools.
- Campos não informados devem ser omitidos se opcionais.
- Confirmações e solicitações de dados devem usar ask_user somente se estritamente necessário prefira sempre finalizar a conversa.
`.trim();

export default class AssistantController {
  private readonly openai = createOpenAIClient();
  private readonly toolRegistry = new AssistantTools(this.repositories);
  private history: ChatCompletionMessageParam[] = [];

  constructor(
    private readonly repositories: Repositories = getRepositories()
  ) {}

  async run(text: string, userLanguage: string): Promise<AssistantRunResult> {
    const context = this.createRunContext(text, userLanguage);
    const toolSchema = this.toolRegistry.buildToolSchema();

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
      const messages = this.buildMessages(context.history);
      const completion = await this.requestCompletion(messages, toolSchema);
      const choice = completion.choices[0];

      if (!choice?.message) {
        context.warnings.push('Resposta vazia do modelo.');
        break;
      }

      const toolCalls = this.appendAssistantResponse(choice.message, context);
      this.recordUsage(completion);

      if (!toolCalls.length) {
        break;
      }

      await this.processToolCalls(toolCalls, context);
      if (context.shouldStop) {
        break;
      }
    }

    this.history = limitHistory(context.history);

    return {
      toolCalls: context.toolExecutions,
      askUserPrompt: context.askUserPrompt,
      warnings: context.warnings,
    };
  }

  private createRunContext(text: string, userLanguage: string): RunContext {
    const history: ChatCompletionMessageParam[] = [...this.history];
    history.push({
      role: 'user',
      content: `Idioma: ${userLanguage}\n${text}`,
    });

    return {
      history,
      warnings: [],
      toolExecutions: [],
      askUserPrompt: null,
      shouldStop: false,
    };
  }

  private buildMessages(history: ChatCompletionMessageParam[]): ChatCompletionMessageParam[] {
    return [{ role: 'system', content: SYSTEM_PROMPT }, ...history];
  }

  private async requestCompletion(
    messages: ChatCompletionMessageParam[],
    tools: ChatCompletionFunctionTool[]
  ) {
    addResourceUse({ ai: { [MODEL]: { requests: 1 } } });
    return this.openai.chat.completions.create({
      model: MODEL,
      messages,
      tools,
      tool_choice: 'required',
      parallel_tool_calls: true,
      temperature: 0.1,
      // reasoning_effort: 'low',
    });
  }

  private appendAssistantResponse(
    message: ChatCompletionMessage,
    context: RunContext
  ): ChatCompletionMessageToolCall[] {
    const assistantMessage: ChatCompletionAssistantMessageParam = {
      role: 'assistant',
      content: message.content,
      tool_calls: message.tool_calls,
    };
    context.history.push(assistantMessage);

    if (message.content && message.content.trim().length > 0) {
      context.warnings.push('O modelo tentou responder com texto livre.');
    }

    return message.tool_calls || [];
  }

  private recordUsage(completion: { usage?: { prompt_tokens?: number; completion_tokens?: number } }) {
    const { prompt_tokens: input, completion_tokens: output } = completion.usage ?? {};
    if (!input && !output) return;

    addResourceUse({
      ai: {
        [MODEL]: {
          input,
          output,
        },
      },
    });
  }

  private async processToolCalls(
    toolCalls: ChatCompletionMessageToolCall[],
    context: RunContext
  ): Promise<void> {
    for (const toolCall of toolCalls) {
      const { id, function: fn } = toolCall;
      const name = fn?.name as AssistantToolName | undefined;
      if (!id || !name) {
        context.warnings.push('Tool call sem identificação ou nome.');
        continue;
      }

      const args = this.parseToolArguments(id, name, fn?.arguments, context);
      if (!args) {
        continue;
      }

      await this.executeToolCall(id, name, args, context);
      if (context.shouldStop) {
        return;
      }
    }
  }

  private parseToolArguments(
    id: string,
    name: AssistantToolName,
    rawArguments: string | undefined,
    context: RunContext
  ): Record<string, unknown> | null {
    try {
      return rawArguments ? JSON.parse(rawArguments) : {};
    } catch (error) {
      context.warnings.push(`Falha ao interpretar argumentos de ${name}.`);
      context.toolExecutions.push({
        id,
        name,
        arguments: {},
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        executedAt: Date.now(),
      });
      return null;
    }
  }

  private async executeToolCall(
    id: string,
    name: AssistantToolName,
    args: Record<string, unknown>,
    context: RunContext
  ): Promise<void> {
    try {
      const result = await this.toolRegistry.execute(name, args);
      context.toolExecutions.push({
        id,
        name,
        arguments: args,
        status: 'acknowledged',
        result,
        executedAt: Date.now(),
      });

      const toolMessage: ChatCompletionToolMessageParam = {
        role: 'tool',
        tool_call_id: id,
        content: JSON.stringify(result ?? {}),
      };
      context.history.push(toolMessage);

      if (name === 'ask_user') {
        context.askUserPrompt = (result as AskUserPayload) ?? null;
        context.shouldStop = true;
      }
    } catch (error) {
      const messageError = error instanceof Error ? error.message : String(error);
      context.toolExecutions.push({
        id,
        name,
        arguments: args,
        status: 'failed',
        error: messageError,
        executedAt: Date.now(),
      });

      const toolMessage: ChatCompletionToolMessageParam = {
        role: 'tool',
        tool_call_id: id,
        content: JSON.stringify({ acknowledged: false, error: messageError }),
      };
      context.history.push(toolMessage);
      context.warnings.push(`Falha ao executar ${name}: ${messageError}`);
    }
  }
}

type RunContext = {
  history: ChatCompletionMessageParam[];
  warnings: string[];
  toolExecutions: AssistantToolCallLog[];
  askUserPrompt: AskUserPayload | null;
  shouldStop: boolean;
};

function limitHistory(history: ChatCompletionMessageParam[]): ChatCompletionMessageParam[] {
  if (history.length <= HISTORY_LIMIT) return history;
  return history.slice(history.length - HISTORY_LIMIT);
}
