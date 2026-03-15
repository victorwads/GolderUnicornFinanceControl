import { ReactNode } from "react";
import { matchPath, useLocation, useOutlet } from "react-router-dom";

import { useIsLandscapeLayout } from "@hooks/use-mobile";
import { cn } from "@lib/utils";

const MASTER_DETAIL_TRANSITION_MS = 280;

interface MasterDetailShellProps {
  listPane: ReactNode;
  basePath: string;
}

export default function MasterDetailShell({
  listPane,
  basePath,
}: MasterDetailShellProps) {
  const isLandscapeLayout = useIsLandscapeLayout();
  const location = useLocation();
  const outlet = useOutlet();

  const isIdleState = !!matchPath({ path: basePath, end: true }, location.pathname);
  const isDetailOpen = !isIdleState;

  if (!isLandscapeLayout) {
    return outlet;
  }

  return (
    <div className="relative min-h-screen w-full px-4 py-4 lg:px-6">
      <div
        className="grid min-h-[calc(100vh-2rem)] w-full transition-[grid-template-columns] ease-out"
        style={{
          gridTemplateColumns: isDetailOpen
            ? "minmax(360px, 38%) minmax(0, 62%)"
            : "minmax(0, 1fr) 0px",
          transitionDuration: `${MASTER_DETAIL_TRANSITION_MS}ms`,
        }}
      >
        <section className="min-w-0 overflow-hidden">
          <div
            className={cn(
              "h-full overflow-hidden rounded-3xl border border-border/60 bg-card transition-[border-radius,box-shadow] ease-out",
              isDetailOpen ? "shadow-sm" : "shadow-none"
            )}
            style={{ transitionDuration: `${MASTER_DETAIL_TRANSITION_MS}ms` }}
          >
            <div
              className={cn(
                "h-full overflow-y-auto transition-[max-width] ease-out",
                isDetailOpen ? "max-w-none" : "mx-auto w-full"
              )}
              style={{ transitionDuration: `${MASTER_DETAIL_TRANSITION_MS}ms` }}
            >
              {listPane}
            </div>
          </div>
        </section>

        <section
          className={cn(
            "min-w-0 overflow-hidden pl-0 transition-[opacity,transform,padding] ease-out",
            isDetailOpen ? "translate-x-0 pl-4 opacity-100" : "pointer-events-none translate-x-8 opacity-0"
          )}
          style={{ transitionDuration: `${MASTER_DETAIL_TRANSITION_MS}ms` }}
        >
          <div className="h-full overflow-hidden rounded-3xl border border-border/60 bg-background shadow-sm">
            <div className="h-full overflow-y-auto">
              {isDetailOpen ? outlet : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
