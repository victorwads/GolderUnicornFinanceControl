import "./TabScreen.css";
import { Outlet } from "react-router-dom";

import {
  Container,
  ContainerFixedContent,
  ContainerScrollContent,
} from "@containers";

import { TabBar } from "@components/TabBar";
import { useAssistantContext } from "@features/assistant/AssistantContext";
import { useTabBarModel } from "@pages/core/TabBar.model";

const TabScreen = () => {
  const { isOpen, setIsOpen } = useAssistantContext();
  const model = useTabBarModel({
    isAssistantOpen: isOpen,
    onAssistantToggle: () => setIsOpen(!isOpen),
  });

  return (
    <Container wide full>
      <ContainerScrollContent>
        <Outlet />
      </ContainerScrollContent>
      <ContainerFixedContent>
        <TabBar model={model} />
      </ContainerFixedContent>
    </Container>
  );
};

export default TabScreen;
