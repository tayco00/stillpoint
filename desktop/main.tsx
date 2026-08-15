import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StillpointApp } from "../app/components/StillpointApp";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Stillpoint konnte nicht gestartet werden.");
}

createRoot(root).render(
  <StrictMode>
    <StillpointApp />
  </StrictMode>,
);
