import "./index.css";
import ReactDOM from "react-dom/client";

import "./global";
import "./data/firebase/google-services";
import { VarsProvider } from "@components/Vars";
import App from "./App";
import { registerSW } from "virtual:pwa-register";
import { StrictMode } from "react";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
  <VarsProvider>
    <App />
    <svg style={{ display: "none" }}>
      <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
        <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  </VarsProvider>
  </StrictMode>
);

if (import.meta.env.PROD) {
  registerSW({
    immediate: true,
    onRegisterError(error) {
      console.error("Service worker registration failed", error);
    },
  });
}
