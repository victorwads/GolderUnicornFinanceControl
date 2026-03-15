import { ReactNode } from "react";
import { Outlet } from "react-router-dom";

import { useIsLandscapeLayout } from "@hooks/use-mobile";

interface MasterDetailShellProps {
  listPane: ReactNode;
}

export default function MasterDetailShell({ listPane }: MasterDetailShellProps) {
  const isLandscapeLayout = useIsLandscapeLayout();

  if (!isLandscapeLayout) {
    return <Outlet />;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-0 px-4 py-4 lg:px-6">
      <aside className="w-full max-w-[420px] shrink-0 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
        <div className="h-full overflow-y-auto">
          {listPane}
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-hidden rounded-3xl border border-border/60 bg-background shadow-sm">
        <div className="h-full overflow-y-auto">
          <Outlet />
        </div>
      </main>
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
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function ResponsiveMasterDetailIndex({
  portraitContent,
  landscapeContent,
}: {
  portraitContent: ReactNode;
  landscapeContent: ReactNode;
}) {
  const isLandscapeLayout = useIsLandscapeLayout();

  return isLandscapeLayout ? landscapeContent : portraitContent;
}
