import Timeline from "@layouts/core/Timeline";
import { useTimelineModel } from "./Timeline.model";

export default function TimelinePage() {
  const model = useTimelineModel();
  return <Timeline model={model} />;
}
