import { FunctionDefinition } from "openai/resources/shared";
import { Result } from "src/data/models/metadata";

export type AssistantToolName =
  | 'ask_aditional_info'
  | 'list_available_actions'
  | 'list_navigation_options'
  | 'search_accounts_ids'
  | 'search_credit_cards_ids'
  | 'search_banks_ids'
  | 'search_categories_ids'
  | 'action_navigate_to_screen'
  | 'action_create_transfer'
  | 'action_create_account_entry'
  | 'action_create_creditcard_entry'

export type AssistantToolStatus = 'acknowledged' | 'failed';

export type AssistantToolExecution<T> = (...args: any[]) => Promise<T>;

export type AssistantToolDefinition<T> = FunctionDefinition & {
  execute?: AssistantToolExecution<T>;
  userInfo?: (args: Record<string, unknown>, result?: unknown) => string | undefined;
}

export interface AssistantToolCallLog {
  id: string;
  name: AssistantToolName | 'user_message';
  arguments: Record<string, unknown>;
  result?: unknown;
  userInfo?: string;
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
  warnings: string[];
}
