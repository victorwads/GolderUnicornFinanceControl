export function isTimelineDetailPath(pathname: string) {
  return pathname.startsWith("/timeline/entry/");
}

export function buildTimelineReturnPath(search: string) {
  return `/timeline${search}`;
}
