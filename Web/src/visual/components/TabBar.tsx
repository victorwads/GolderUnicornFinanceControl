import { Home, Clock, MoreHorizontal } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@lib/utils";

const tabs = [
  { name: "Home", path: "/", icon: Home },
  { name: "Timeline", path: "/timeline", icon: Clock },
  { name: "More", path: "/more", icon: MoreHorizontal },
];

export const TabBar = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 pb-safe">
      <div className="grid grid-cols-3 items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab, index) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
