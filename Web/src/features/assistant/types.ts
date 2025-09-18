import { FunctionDefinition } from "openai/resources/shared";

export type AssistantToolName =
  | 'list_available_actions'
  | 'search_accounts'
  | 'search_credit_cards'
  | 'search_categories'
  | 'create_transfer'
  | 'create_account_entry'
  | 'create_creditcard_entry'
  | 'ask_user';

export type AssistantToolStatus = 'acknowledged' | 'failed';

export type AssistantToolDefinition = FunctionDefinition & {
  execute: (...args: any[]) => Promise<any>;
}

export interface AssistantToolCallLog {
  id: string;
  name: AssistantToolName;
  arguments: Record<string, unknown>;
  status: AssistantToolStatus;
  result?: unknown;
  error?: string;
  executedAt: number;
}

export interface AskUserOption {
  id: string;
  label: string;
}

export interface AskUserPayload {
  message: string;
  options?: AskUserOption[];
}

export interface AssistantRunResult {
  toolCalls: AssistantToolCallLog[];
  askUserPrompt: AskUserPayload | null;
  warnings: string[];
}
