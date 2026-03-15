import "./TabScreen.css";
import { Outlet } from "react-router-dom";

import {
  Container,
  ContainerFixedContent,
  ContainerScrollContent,
} from "@containers";

import { TabBar } from "@components/TabBar";

const TabScreen = () => {
  return (
    <Container wide full>
      <ContainerScrollContent>
        <Outlet />
      </ContainerScrollContent>
      <ContainerFixedContent>
          <TabBar />
      </ContainerFixedContent>
    </Container>
  );
};

export default TabScreen;
