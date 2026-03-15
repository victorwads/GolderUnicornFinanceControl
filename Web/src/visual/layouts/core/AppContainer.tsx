import { Outlet } from "react-router-dom";
import { MicButton } from "@components/MicButton";
import { TabBar } from "@components/TabBar";
import { useTabBarModel } from "../../../pages/core/TabBar.model";

const AppContainer = () => {
  const model = useTabBarModel();

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
      </main>
      <MicButton />
      <TabBar model={model} />
    </div>
  );
};

export default AppContainer;
