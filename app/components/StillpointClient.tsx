"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useStillpoint } from "../hooks/useStillpoint";

type StillpointContextValue = ReturnType<typeof useStillpoint>;

const StillpointContext = createContext<StillpointContextValue | null>(null);

export function StillpointClient({ children }: { children: ReactNode }) {
  const value = useStillpoint();
  return <StillpointContext.Provider value={value}>{children}</StillpointContext.Provider>;
}

export function useStillpointContext() {
  const value = useContext(StillpointContext);
  if (!value) throw new Error("Stillpoint tools must be inside StillpointClient.");
  return value;
}
