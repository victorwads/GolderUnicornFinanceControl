import "./TabScreen.css";
import { Outlet } from "react-router-dom";

import {
  Container,
  ContainerFixedContent,
  ContainerScrollContent,
} from "@containers";

import { TabBar } from "@components/TabBar";
import { useTabBarModel } from "@pages/core/TabBar.model";

const TabScreen = () => {
  const model = useTabBarModel();

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
