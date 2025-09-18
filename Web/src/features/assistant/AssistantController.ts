import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionMessageParam,
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

const MODEL = 'gpt-4.1-mini';
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
- Limite suas buscas a no máximo 5 resultados.
- Converta datas relativas como "hoje" para YYYY-MM-DD nos argumentos enviados às tools.
- Quando o usuário estiver incerto, utilize list_available_actions.
- Confirmações e solicitações de dados devem usar ask_user.
`.trim();

export default class AssistantController {
  private readonly openai = createOpenAIClient();
  private readonly toolRegistry = new AssistantTools();
  private history: ChatCompletionMessageParam[] = [];

  private buildToolSchema() {
    return this.toolRegistry.getDefinitions().map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  async run(text: string, userLanguage: string): Promise<AssistantRunResult> {
    const warnings: string[] = [];
    const toolExecutions: AssistantToolCallLog[] = [];
    let askUserPrompt: AskUserPayload | null = null;

    const scopedHistory: ChatCompletionMessageParam[] = [...this.history];
    scopedHistory.push({
      role: 'user',
      content: `Idioma: ${userLanguage}\n${text}`,
    });

    const toolSchema = this.buildToolSchema();
    let shouldStop = false;

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...scopedHistory,
      ];

      const completion = await this.openai.chat.completions.create({
        model: MODEL,
        messages,
        tools: toolSchema,
        tool_choice: 'auto',
        parallel_tool_calls: false,
        temperature: 0.1,
      });

      const choice = completion.choices[0];
      if (!choice?.message) {
        warnings.push('Resposta vazia do modelo.');
        break;
      }

      const message = choice.message;
      const assistantMessage: ChatCompletionAssistantMessageParam = {
        role: 'assistant',
        content: message.content,
        tool_calls: message.tool_calls,
      };
      scopedHistory.push(assistantMessage);

      if (message.content && message.content.trim().length > 0) {
        warnings.push('O modelo tentou responder com texto livre.');
      }

      const toolCalls = message.tool_calls || [];
      if (!toolCalls.length) {
        break;
      }

      for (const toolCall of toolCalls) {
        const { id, function: fn } = toolCall;
        const name = fn?.name as AssistantToolName | undefined;
        if (!id || !name) {
          warnings.push('Tool call sem identificação ou nome.');
          continue;
        }

        let parsedArgs: Record<string, unknown> = {};
        try {
          parsedArgs = fn?.arguments ? JSON.parse(fn.arguments) : {};
        } catch (error) {
          warnings.push(`Falha ao interpretar argumentos de ${name}.`);
          toolExecutions.push({
            id,
            name,
            arguments: {},
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
            executedAt: Date.now(),
          });
          continue;
        }

        try {
          const result = await this.toolRegistry.execute(name, parsedArgs);
          const execution: AssistantToolCallLog = {
            id,
            name,
            arguments: parsedArgs,
            status: 'acknowledged',
            result,
            executedAt: Date.now(),
          };
          toolExecutions.push(execution);

          const toolMessage: ChatCompletionToolMessageParam = {
            role: 'tool',
            tool_call_id: id,
            content: JSON.stringify(result ?? {}),
          };
          scopedHistory.push(toolMessage);

          if (name === 'ask_user') {
            askUserPrompt = (result as AskUserPayload) ?? null;
            shouldStop = true;
          }
        } catch (error) {
          const messageError = error instanceof Error ? error.message : String(error);
          toolExecutions.push({
            id,
            name,
            arguments: parsedArgs,
            status: 'failed',
            error: messageError,
            executedAt: Date.now(),
          });

          const toolMessage: ChatCompletionToolMessageParam = {
            role: 'tool',
            tool_call_id: id,
            content: JSON.stringify({ acknowledged: false, error: messageError }),
          };
          scopedHistory.push(toolMessage);
          warnings.push(`Falha ao executar ${name}: ${messageError}`);
        }
      }

      if (shouldStop) {
        break;
      }
    }

    this.history = limitHistory(scopedHistory);

    return {
      toolCalls: toolExecutions,
      askUserPrompt,
      warnings,
    };
  }
}

function limitHistory(history: ChatCompletionMessageParam[]): ChatCompletionMessageParam[] {
  if (history.length <= HISTORY_LIMIT) return history;
  return history.slice(history.length - HISTORY_LIMIT);
}
