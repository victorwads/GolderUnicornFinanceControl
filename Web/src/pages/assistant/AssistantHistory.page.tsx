import AssistantHistoryList from "@layouts/assistant/AssistantHistoryList";

import { useAssistantHistoryModel } from "./AssistantHistory.model";

export default function AssistantHistoryPage({ embedded = false }: { embedded?: boolean }) {
  const model = useAssistantHistoryModel();
  return <AssistantHistoryList model={model} embedded={embedded} />;
}
