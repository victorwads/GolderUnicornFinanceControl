import "./TabScreen.css";
import { Outlet } from "react-router-dom";

import {
  Container,
  ContainerFixedContent,
  ContainerScrollContent,
} from "@containers";

import { TabBar } from "@components/TabBar";
import { useAssistantChatboxModel } from "@features/assistant/AIChatbox.model";
import AIChatbox from "@layouts/assistant/AIChatbox";
import { useTabBarModel } from "@pages/core/TabBar.model";

const TabScreen = () => {
  const chatboxModel = useAssistantChatboxModel();
  const model = useTabBarModel({
    isAssistantOpen: chatboxModel.open,
    onAssistantToggle: chatboxModel.onToggle,
  });

  return (
    <Container wide full>
      <ContainerScrollContent>
        <Outlet />
      </ContainerScrollContent>
      <ContainerFixedContent>
        <AIChatbox model={chatboxModel} />
        <TabBar model={model} />
      </ContainerFixedContent>
    </Container>
  );
};

export default TabScreen;
