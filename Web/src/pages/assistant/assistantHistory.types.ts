import type { AiCallContext } from "@models";

export type PrimitiveRecord = Record<string, unknown>;

export type AssistantToolStatus = "done" | "warning";

export type AssistantToolKind =
  | "search"
  | "navigate"
  | "create"
  | "update"
  | "delete"
  | "ask"
  | "finish";

export type AssistantTimelineEntry =
  | {
      id: string;
      type: "system" | "user" | "assistant";
      timestamp: string;
      content: string;
    }
  | {
      id: string;
      type: "tool";
      timestamp: string;
      toolKind: AssistantToolKind;
      toolName: string;
      status: AssistantToolStatus;
      title: string;
      description: string;
      chips?: string[];
      argumentsPreview?: string;
      resultPreview?: string;
      arguments?: PrimitiveRecord;
      result?: PrimitiveRecord;
    };

export interface AssistantHistoryConversation {
  id: string;
  title: string;
  preview: string;
  relativeTime: string;
  timestampLabel: string;
  model: string;
  cost: number;
  tokensIn: number;
  tokensOut: number;
  toolCallsCount: number;
  warningsCount: number;
  sharedDomains: string[];
  finishReason: string;
  userSummary: string;
  developerSummary: string;
  entries: AssistantTimelineEntry[];
  context: AiCallContext;
}
