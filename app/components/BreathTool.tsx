"use client";

import { useEffect, useState } from "react";

const PHASES = [
  { label: "Einatmen", seconds: 4, mode: "inhale" },
  { label: "Halten", seconds: 4, mode: "hold" },
  { label: "Ausatmen", seconds: 6, mode: "exhale" },
] as const;

type BreathToolProps = { onComplete: () => void };

export function BreathTool({ onComplete }: BreathToolProps) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [remaining, setRemaining] = useState<number>(PHASES[0].seconds);
  const [cycles, setCycles] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      if (remaining > 1) {
        setRemaining(remaining - 1);
        return;
      }

      const nextPhase = (phase + 1) % PHASES.length;
      if (nextPhase === 0) {
        const nextCycle = cycles + 1;
        if (nextCycle >= 3) {
          setRunning(false);
          setCycles(0);
          setPhase(0);
          setRemaining(PHASES[0].seconds);
          setCompleted(true);
          onComplete();
          return;
        }
        setCycles(nextCycle);
      }
      setPhase(nextPhase);
      setRemaining(PHASES[nextPhase].seconds);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cycles, onComplete, phase, remaining, running]);

  const current = PHASES[phase];

  const toggle = () => {
    if (running) {
      setRunning(false);
      return;
    }
    setPhase(0);
    setRemaining(PHASES[0].seconds);
    setCycles(0);
    setCompleted(false);
    setRunning(true);
  };

  return (
    <article className="tool-card breath-card" data-reveal>
      <div className="breath-visual" data-phase={running ? current.mode : "idle"} aria-hidden="true">
        <div className="breath-orb"><span /></div>
      </div>
      <div className="tool-copy">
        <p className="tool-kicker">42 Sekunden</p>
        <h3>Einmal Luft holen.</h3>
        <p>Ein kurzer 4–4–6-Rhythmus, wenn dein Kopf schneller ist als deine Hände.</p>
      </div>
      <div className="breath-controls">
        <div aria-live="polite">
          <strong>{running ? current.label : completed ? "Reset abgeschlossen" : "Bereit"}</strong>
          <span>
            {running
              ? `${remaining} · Runde ${cycles + 1}/3`
              : completed
                ? "Du kannst ruhiger weiter."
                : "Drei ruhige Runden"}
          </span>
        </div>
        <button type="button" onClick={toggle}>
          {running ? "Stoppen" : completed ? "Nochmal" : "Reset starten"}
        </button>
      </div>
    </article>
  );
}
