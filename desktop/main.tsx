import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StillpointApp } from "../app/components/StillpointApp";
import { StillpointClient } from "../app/components/StillpointClient";
import "../app/globals.css";
import { QuickCapture } from "./QuickCapture";
import "./quick-capture.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Stillpoint konnte nicht gestartet werden.");
}

createRoot(root).render(
  <StrictMode>
    {window.location.hash === "#quick-capture" ? (
      <StillpointClient><QuickCapture /></StillpointClient>
    ) : (
      <StillpointApp desktop />
    )}
  </StrictMode>,
);
