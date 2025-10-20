import More from "@layouts/core/More";
import { useMoreModel } from "./More.model";

export default function MorePage() {
  const model = useMoreModel();
  return <More model={model} />;
}
