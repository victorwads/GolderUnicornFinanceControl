import "./TabScreen.css";
import { Outlet } from "react-router-dom";

import {
  Container,
  ContainerFixedContent,
  ContainerScrollContent,
} from "@componentsDeprecated/conteiners";

import { TabBar } from "@components/TabBar";

const TabScreen = () => {
  return (
    <Container wide>
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
