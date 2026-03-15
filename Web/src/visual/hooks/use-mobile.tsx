import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const LANDSCAPE_LAYOUT_BREAKPOINT = 1024;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export function useIsLandscapeLayout() {
  const [isLandscapeLayout, setIsLandscapeLayout] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LANDSCAPE_LAYOUT_BREAKPOINT}px)`);
    const onChange = () => {
      setIsLandscapeLayout(window.innerWidth >= LANDSCAPE_LAYOUT_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsLandscapeLayout(window.innerWidth >= LANDSCAPE_LAYOUT_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isLandscapeLayout;
}
