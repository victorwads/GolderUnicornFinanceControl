import { FunctionDefinition } from "openai/resources/shared";
import { Result } from "src/data/models/metadata";

export type AssistantToolStatus = 'acknowledged' | 'failed';

export type AssistantToolExecution = (...args: any[]) => Promise<Result<unknown>>;

export type AssistantToolDefinition = FunctionDefinition & {
  execute: AssistantToolExecution;
  userInfo?: (args: Record<string, unknown>, result?: unknown) => string | undefined;
}

export interface AssistantToolCallLog {
  id: string;
  name: string;
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
