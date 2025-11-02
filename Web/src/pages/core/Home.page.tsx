import Home from "@layouts/core/Home";
import { useHomeModel } from "./Home.model";

export default function HomePage() {
  const model = useHomeModel();
  return <Home model={model} />;
}
