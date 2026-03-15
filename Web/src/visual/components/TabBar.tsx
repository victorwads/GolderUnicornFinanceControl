import { Home, Clock, MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@lib/utils";

interface TabBarProps {
  model: TabBarViewModel;
}

export const TabBar = ({ model }: TabBarProps) => {
  const { tabs } = model;

  return (
    <nav className="shrink-0 border-t border-border bg-card pb-safe">
      <div className="grid grid-cols-3 items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.isActive;
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              type="button"
              onClick={tab.onClick}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 rounded-xl transition-all duration-300",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "transition-all duration-300",
                  isActive ? "w-6 h-6" : "w-5 h-5"
                )}
              />
              <span className={cn(
                "text-xs font-medium transition-all duration-300",
                isActive && "font-semibold"
              )}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export class TabBarRoute {}

export class ToHomeRoute extends TabBarRoute {}
export class ToTimelineRoute extends TabBarRoute {}
export class ToMoreRoute extends TabBarRoute {}

export interface TabBarItem {
  name: string;
  path: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export interface TabBarViewModel {
  tabs: TabBarItem[];
}

export const tabBarIcons = {
  home: Home,
  timeline: Clock,
  more: MoreHorizontal,
};
