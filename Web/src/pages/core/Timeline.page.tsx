import Timeline from "@layouts/core/Timeline";
import { useTimelineModel } from "./Timeline.model";

export default function TimelinePage({ embedded = false }: { embedded?: boolean }) {
  const model = useTimelineModel();
  return <Timeline model={model} embedded={embedded} />;
}
