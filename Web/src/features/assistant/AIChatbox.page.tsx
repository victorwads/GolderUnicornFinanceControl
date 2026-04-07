import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import AIChatbox from "@layouts/assistant/AIChatbox";
import { useAssistantChatboxModel } from "./AIChatbox.model";
import { AssistantProvider } from "./AssistantContext";

function AssistantSessionContent() {
  const chatboxModel = useAssistantChatboxModel();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || !(event.altKey && event.shiftKey && event.code === "KeyA")) return;

      event.preventDefault();
      chatboxModel.onToggle();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [chatboxModel]);

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
