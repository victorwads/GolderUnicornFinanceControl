import "dotenv"
import { StrictMode } from "react";
import { ThemeProvider } from "next-themes";
import ReactDOM from "react-dom/client";

import "./index.css";
import './visual/shared.css';

import { Toaster } from "@components/ui/toaster";
import { Toaster as Sonner } from "@components/ui/sonner";
import { TooltipProvider } from "@components/ui/tooltip";
import { DensityProvider } from "@contexts/DensityContext";
import { ThemeColorProvider } from "@contexts/ThemeColorContext";

import { AppUpdatesProvider } from "@componentsDeprecated/AppUpdatesProvider";
import { VarsProvider } from "@componentsDeprecated/Vars";

import "./global";
import "./data/firebase/google-services";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <AppUpdatesProvider>
      <VarsProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <ThemeColorProvider>
          <DensityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <App />
          </TooltipProvider>
        </DensityProvider>
        </ThemeColorProvider>
      </ThemeProvider>
        <svg style={{ display: "none" }}>
          <filter id="lg-dist" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
            <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      </VarsProvider>
    </AppUpdatesProvider>
  </StrictMode>
);

declare global {
  interface String {
    cap(): string;
  }
}

String.prototype.cap = function (this: string) {
  return this.charAt(0).toUpperCase()
  + this.slice(1)
}
