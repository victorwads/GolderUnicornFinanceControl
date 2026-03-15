import "./TabScreen.css";
import { Outlet } from "react-router-dom";

import {
  Container,
  ContainerFixedContent,
  ContainerScrollContent,
} from "@containers";

import { TabBar } from "@components/TabBar";
import { VoiceAssistant } from "@components/VoiceAssistant";
import { useTabBarModel } from "@pages/core/TabBar.model";
import { useVoiceAssistantModel } from "@pages/assistant/VoiceAssistant.model";

const TabScreen = () => {
  const model = useTabBarModel();
  const voiceAssistantModel = useVoiceAssistantModel();

  return (
    <Container wide full>
      <ContainerScrollContent>
        <Outlet />
      </ContainerScrollContent>
      <ContainerFixedContent>
          <VoiceAssistant model={voiceAssistantModel} />
          <TabBar model={model} />
      </ContainerFixedContent>
    </Container>
  );
};

export default TabScreen;
