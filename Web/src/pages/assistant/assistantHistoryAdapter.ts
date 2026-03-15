import type { AiCallContext } from "@models";

import {
  buildArgumentsPreview,
  buildResultPreview,
  buildToolChips,
  describeTool,
  isObject,
  truncateText,
} from "./assistantHistoryToolMetadata";
import type { AssistantHistoryConversation, AssistantTimelineEntry, PrimitiveRecord } from "./assistantHistory.types";

export type { AssistantHistoryConversation, AssistantTimelineEntry } from "./assistantHistory.types";

type PendingToolCall = {
  id: string;
  name: string;
  args: PrimitiveRecord;
};

export function buildAssistantHistoryConversations(contexts: AiCallContext[]): AssistantHistoryConversation[] {
  return contexts
    .filter((context) => context.version === 2)
    .map(buildAssistantHistoryConversation)
    .sort((a, b) => getConversationTimestamp(b.context) - getConversationTimestamp(a.context));
}

export function buildAssistantHistoryConversation(context: AiCallContext): AssistantHistoryConversation {
  const entries = buildTimelineEntries(context);
  const toolEntries = entries.filter(isToolEntry);
  const userEntries = entries.filter(isUserEntry);
  const meaningfulUserEntries = userEntries.filter((entry) => !isLowSignalUserMessage(entry.content));
  const assistantEntries = entries.filter(isAssistantEntry);
  const warningsCount = Array.isArray(context.warnings) ? context.warnings.length : 0;
  const LocalLang = Lang.visual.assistant.adapter;

  return {
    id: context.id,
    title: deriveConversationTitle(context, meaningfulUserEntries, userEntries),
    preview: buildConversationPreview(toolEntries, assistantEntries, meaningfulUserEntries, userEntries),
    relativeTime: formatRelativeTime(getConversationTimestamp(context)),
    timestampLabel: new Date(getConversationTimestamp(context)).toLocaleString(CurrentLangInfo.short),
    model: context.model,
    cost: context.getCostBRL(),
    tokensIn: context.tokens?.input ?? 0,
    tokensOut: context.tokens?.output ?? 0,
    toolCallsCount: toolEntries.length,
    warningsCount,
    sharedDomains: Array.isArray(context.sharedDomains) ? context.sharedDomains : [],
    finishReason: context.finishReason || "in_progress",
    userSummary: buildUserSummary(toolEntries, assistantEntries[assistantEntries.length - 1]?.content),
    developerSummary: LocalLang.developerSummary(toolEntries.length, warningsCount, context.model),
    entries,
    context,
  };
}

function buildTimelineEntries(context: AiCallContext): AssistantTimelineEntry[] {
  const history = Array.isArray(context.history) ? context.history : [];
  const entries: AssistantTimelineEntry[] = [];
  const pendingToolCalls = new Map<string, PendingToolCall>();
  const baseDate = getContextBaseDate(context);

  history.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") return;

    const timestamp = buildEntryTimestamp(baseDate, index);
    const role = (entry as { role?: string }).role;

    switch (role) {
      case "system":
        entries.push({
          id: `system-${index}`,
          type: "system",
          timestamp,
          content: formatMessageContent((entry as { content?: unknown }).content),
        });
        return;

      case "user": {
        const content = formatMessageContent((entry as { content?: unknown }).content);
        if (!content) return;

        entries.push({
          id: `user-${index}`,
          type: isMetadataUserEntry(content) ? "system" : "user",
          timestamp,
          content,
        });
        return;
      }

      case "assistant": {
        const assistantEntry = entry as {
          content?: unknown;
          tool_calls?: Array<{ id?: string; function?: { name?: string; arguments?: string } }>;
        };
        const content = formatMessageContent(assistantEntry.content);

        if (content) {
          entries.push({
            id: `assistant-${index}`,
            type: "assistant",
            timestamp,
            content,
          });
        }

        assistantEntry.tool_calls?.forEach((toolCall) => {
          const toolId = toolCall?.id;
          const toolName = toolCall?.function?.name;
          if (!toolId || !toolName) return;

          pendingToolCalls.set(toolId, {
            id: toolId,
            name: toolName,
            args: parseJsonRecord(toolCall.function?.arguments),
          });
        });
        return;
      }

      case "tool": {
        const toolCallId = (entry as { tool_call_id?: string }).tool_call_id;
        if (!toolCallId) return;

        const pendingToolCall = pendingToolCalls.get(toolCallId);
        entries.push(
          buildToolTimelineEntry(
            `tool-${toolCallId}`,
            timestamp,
            pendingToolCall?.name || "tool",
            pendingToolCall?.args || {},
            parseJsonRecord((entry as { content?: unknown }).content)
          )
        );
        return;
      }

      default:
        return;
    }
  });

  const internalErrors = (Array.isArray(context.warnings) ? context.warnings : [])
    .filter((warning): warning is string => typeof warning === "string" && warning.startsWith("internal_error:"));

  internalErrors.forEach((warning, index) => {
    entries.push({
      id: `system-internal-error-${index}`,
      type: "system",
      timestamp: buildEntryTimestamp(baseDate, history.length + index),
      content: formatInternalErrorWarning(warning),
    });
  });

  return entries;
}

function buildToolTimelineEntry(
  id: string,
  timestamp: string,
  toolName: string,
  args: PrimitiveRecord,
  result: PrimitiveRecord
): Extract<AssistantTimelineEntry, { type: "tool" }> {
  const { title, description, toolKind } = describeTool(toolName, args, result);

  return {
    id,
    type: "tool",
    timestamp,
    toolKind,
    toolName,
    status: result.success === false ? "warning" : "done",
    title,
    description,
    chips: buildToolChips(toolName, args, result),
    argumentsPreview: buildArgumentsPreview(toolName, args),
    resultPreview: buildResultPreview(result),
    arguments: args,
    result,
  };
}

function buildConversationPreview(
  toolEntries: Extract<AssistantTimelineEntry, { type: "tool" }>[],
  assistantEntries: Extract<AssistantTimelineEntry, { type: "assistant" }>[],
  meaningfulUserEntries: Extract<AssistantTimelineEntry, { type: "user" }>[],
  userEntries: Extract<AssistantTimelineEntry, { type: "user" }>[]
): string {
  const LocalLang = Lang.visual.assistant.adapter;
  const actionTitles = uniqueActionTitles(toolEntries).slice(0, 2);

  if (actionTitles.length > 0) {
    return LocalLang.previewActions(formatList(actionTitles), toolEntries.length > actionTitles.length);
  }

  return truncateText(
    assistantEntries[assistantEntries.length - 1]?.content ||
      meaningfulUserEntries[0]?.content ||
      userEntries[0]?.content ||
      LocalLang.emptyPreview,
    140
  );
}

function buildUserSummary(
  toolEntries: Extract<AssistantTimelineEntry, { type: "tool" }>[],
  finalAssistantMessage?: string
): string {
  const LocalLang = Lang.visual.assistant.adapter;
  if (finalAssistantMessage) return finalAssistantMessage;

  const actionTitles = uniqueActionTitles(toolEntries).slice(0, 3);
  return actionTitles.length > 0 ? LocalLang.summaryFromActions(formatList(actionTitles)) : LocalLang.noAdditionalActions;
}

function deriveConversationTitle(
  context: AiCallContext,
  meaningfulUserEntries: Extract<AssistantTimelineEntry, { type: "user" }>[],
  userEntries: Extract<AssistantTimelineEntry, { type: "user" }>[]
): string {
  const LocalLang = Lang.visual.assistant.adapter;
  const bestEntry =
    meaningfulUserEntries.find((entry) => isGoodConversationTitle(entry.content)) ||
    meaningfulUserEntries[0] ||
    userEntries.find((entry) => entry.content.trim().length > 0);

  return bestEntry?.content ? truncateText(bestEntry.content, 60) : context.id || LocalLang.untitledConversation;
}

function uniqueActionTitles(toolEntries: Extract<AssistantTimelineEntry, { type: "tool" }>[]): string[] {
  const seen = new Set<string>();
  const titles: string[] = [];

  toolEntries.forEach((entry) => {
    const normalized = entry.title.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    titles.push(entry.title);
  });

  return titles;
}

function isLowSignalUserMessage(content: string): boolean {
  const words = content.trim().split(/\s+/).filter(Boolean);
  return content.trim().length < 12 || words.length <= 2;
}

function isGoodConversationTitle(content: string): boolean {
  const words = content.trim().split(/\s+/).filter(Boolean);
  return content.trim().length >= 12 && words.length >= 3;
}

function parseJsonRecord(value: unknown): PrimitiveRecord {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isObject(parsed) ? parsed : { result: parsed };
    } catch {
      return { result: value };
    }
  }

  return isObject(value) ? value : {};
}

function formatMessageContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (isObject(item) && typeof item.text === "string" ? item.text : ""))
      .filter(Boolean)
      .join("\n");
  }
  if (content == null) return "";
  return JSON.stringify(content, null, 2);
}

function formatInternalErrorWarning(warning: string): string {
  return warning.replace(/^internal_error:\s*/i, "Internal error: ");
}

function isMetadataUserEntry(content: string): boolean {
  return content.startsWith("User native language:") || content.startsWith("Current DateTime:");
}

function getContextBaseDate(context: AiCallContext): Date {
  return normalizeDate(context._createdAt) || normalizeDate(context._updatedAt) || new Date();
}

function getConversationTimestamp(context: AiCallContext): number {
  const date = normalizeDate(context.finishedAt) || normalizeDate(context._updatedAt) || normalizeDate(context._createdAt) || new Date();
  return date.getTime();
}

function buildEntryTimestamp(baseDate: Date, index: number): string {
  return new Date(baseDate.getTime() + index * 1000).toLocaleTimeString(CurrentLangInfo.short, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function normalizeDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function formatRelativeTime(timestamp: number): string {
  const deltaMs = timestamp - Date.now();
  const rtf = new Intl.RelativeTimeFormat(CurrentLangInfo.short, { numeric: "auto" });
  const minutes = Math.round(deltaMs / (1000 * 60));
  const hours = Math.round(deltaMs / (1000 * 60 * 60));
  const days = Math.round(deltaMs / (1000 * 60 * 60 * 24));

  switch (true) {
    case Math.abs(minutes) < 60:
      return rtf.format(minutes, "minute");
    case Math.abs(hours) < 24:
      return rtf.format(hours, "hour");
    default:
      return rtf.format(days, "day");
  }
}

function formatList(items: string[]): string {
  return new Intl.ListFormat(CurrentLangInfo.short, { style: "long", type: "conjunction" }).format(items);
}

function isToolEntry(entry: AssistantTimelineEntry): entry is Extract<AssistantTimelineEntry, { type: "tool" }> {
  return entry.type === "tool";
}

function isUserEntry(entry: AssistantTimelineEntry): entry is Extract<AssistantTimelineEntry, { type: "user" }> {
  return entry.type === "user";
}

function isAssistantEntry(entry: AssistantTimelineEntry): entry is Extract<AssistantTimelineEntry, { type: "assistant" }> {
  return entry.type === "assistant";
}
