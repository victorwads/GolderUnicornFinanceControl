import AssistantHistoryDetail from "@layouts/assistant/AssistantHistoryDetail";

import { useAssistantConversationModel } from "./AssistantConversation.model";

export default function AssistantConversationPage() {
  const model = useAssistantConversationModel();
  return <AssistantHistoryDetail model={model} />;
}
