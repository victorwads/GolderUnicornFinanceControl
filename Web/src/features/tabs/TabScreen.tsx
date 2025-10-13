import "./TabScreen.css";
import { Link, Outlet } from "react-router-dom";

import Icon, { Icons } from "@components/Icons";
import {
  Container,
  ContainerFixedContent,
  ContainerScrollContent,
} from "@components/conteiners";

import AssistantAIMicrophone from "@features/assistant/components/AssistantAIMicrophone";
import AssistantOnboardingDialog from "@features/assistant/components/AssistantOnboardingDialog";

const TabScreen = () => {
  return (
    <Container wide>
      <ContainerScrollContent>
        <Outlet />
      </ContainerScrollContent>
      <ContainerFixedContent>
        <AssistantOnboardingDialog />
        <div className="TabViewNav">
          <Link to="dashboard">
            <Icon size="lg" icon={Icons.faHome} />
            <span> {Lang.dashboard.title}</span>
          </Link>
          <Link to="timeline">
            <Icon size="lg" icon={Icons.faChartLine} />
            <span> {Lang.timeline.title}</span>
          </Link>
          <div className="AiMicrophoneButtonContainer">
            <AssistantAIMicrophone />
          </div>
          <Link to="groceries">
            <Icon size="lg" icon={Icons.faShoppingBasket} />
            <span> {Lang.groceries.title}</span>
          </Link>
          <Link to="settings">
            <Icon size="lg" icon={Icons.faGear} />
            <span> {Lang.settings.title}</span>
          </Link>
        </div>
      </ContainerFixedContent>
    </Container>
  );
};

export default TabScreen;
