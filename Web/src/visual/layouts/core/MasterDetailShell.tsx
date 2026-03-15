import { ReactNode } from "react";
import { matchPath, useLocation, useOutlet } from "react-router-dom";

import { useIsLandscapeLayout } from "@hooks/use-mobile";
import { cn } from "@lib/utils";

interface MasterDetailShellProps {
  listPane: ReactNode;
  basePath: string;
  idleContent?: ReactNode;
}

export default function MasterDetailShell({
  listPane,
  basePath,
  idleContent,
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
        className="grid min-h-[calc(100vh-2rem)] w-full transition-[grid-template-columns] duration-200 ease-out"
        style={{
          gridTemplateColumns: isDetailOpen
            ? "minmax(360px, 38%) minmax(0, 62%)"
            : "minmax(0, 1fr) 0px",
        }}
      >
        <section className="min-w-0 overflow-hidden">
          <div
            className={cn(
              "h-full overflow-hidden rounded-3xl border border-border/60 bg-card transition-[border-radius,box-shadow] duration-200 ease-out",
              isDetailOpen ? "shadow-sm" : "shadow-none"
            )}
          >
            <div
              className={cn(
                "h-full overflow-y-auto transition-[max-width] duration-200 ease-out",
                isDetailOpen ? "max-w-none" : "mx-auto w-full"
              )}
            >
              {listPane}
            </div>
          </div>
        </section>

        <section
          className={cn(
            "min-w-0 overflow-hidden pl-0 transition-[opacity,transform,padding] duration-200 ease-out",
            isDetailOpen ? "translate-x-0 pl-4 opacity-100" : "pointer-events-none translate-x-8 opacity-0"
          )}
        >
          <div className="h-full overflow-hidden rounded-3xl border border-border/60 bg-background shadow-sm">
            <div className="h-full overflow-y-auto">
              {isDetailOpen ? outlet : null}
            </div>
          </div>
        </section>
      </div>

      {!isDetailOpen && idleContent ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 py-16">
          {idleContent}
        </div>
      ) : null}
    </div>
  );
}

export function MasterDetailPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-border/60 bg-background/95 p-8 text-center shadow-lg backdrop-blur-sm">
      <div className="mx-auto max-w-md">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
