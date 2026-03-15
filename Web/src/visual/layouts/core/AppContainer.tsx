import { Outlet } from "react-router-dom";
import { MicButton } from "@components/MicButton";
import { TabBar } from "@components/TabBar";

const AppContainer = () => {
  return (
    <div className="min-h-screen bg-background pb-36">
      <Outlet />
      <MicButton />
      <TabBar />
    </div>
  );
};

export default AppContainer;