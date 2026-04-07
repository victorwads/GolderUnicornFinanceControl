import { Outlet } from "react-router-dom";

import AIChatbox from "@layouts/assistant/AIChatbox";
import { useAssistantChatboxModel } from "./AIChatbox.model";
import { AssistantProvider } from "./AssistantContext";

function AssistantSessionContent() {
  const chatboxModel = useAssistantChatboxModel();
  return <AIChatbox model={chatboxModel} />;
}

export default function AssistantSessionRoot() {
  return (
    <AssistantProvider>
      <AssistantSessionContent />
      <Outlet />
    </AssistantProvider>
  );
}