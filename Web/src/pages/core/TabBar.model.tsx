import { useLocation, useNavigate } from "react-router-dom";

import {
  TabBarItem,
  TabBarRoute,
  TabBarViewModel,
  ToHomeRoute,
  ToMoreRoute,
  ToTimelineRoute,
  tabBarIcons,
} from "@components/TabBar";

function isNestedPath(pathname: string, basePath: string) {
  if (basePath === "/") {
    return pathname === "/";
  }

  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function isMoreSection(pathname: string) {
  return [
    "/settings",
    "/me/linkedaccounts",
    "/me/resource-usage",
    "/me/privacy",
    "/subscriptions",
    "/ai-calls",
    "/assistant",
    "/accounts",
    "/creditcards",
    "/categories",
    "/recurrents",
  ].some((path) => isNestedPath(pathname, path));
}

export function useTabBarModel(): TabBarViewModel {
  const navigate = useNavigate();
  const location = useLocation();

  function onNavigate(route: TabBarRoute) {
    switch (true) {
      case route instanceof ToHomeRoute:
        navigate("/");
        break;

      case route instanceof ToTimelineRoute:
        navigate("/timeline");
        break;

      case route instanceof ToMoreRoute:
        navigate("/settings");
        break;

      default:
        console.warn("Unknown route type", route);
        break;
    }
  }

  const tabs: TabBarItem[] = [
    {
      name: Lang.commons.gohome,
      path: "/",
      icon: tabBarIcons.home,
      isActive: isNestedPath(location.pathname, "/"),
      onClick: () => onNavigate(new ToHomeRoute()),
    },
    {
      name: Lang.timeline.title,
      path: "/timeline",
      icon: tabBarIcons.timeline,
      isActive: isNestedPath(location.pathname, "/timeline"),
      onClick: () => onNavigate(new ToTimelineRoute()),
    },
    {
      name: Lang.visual.more.title,
      path: "/settings",
      icon: tabBarIcons.more,
      isActive: isMoreSection(location.pathname),
      onClick: () => onNavigate(new ToMoreRoute()),
    },
  ];

  return { tabs };
}
