"use client";

import { useEffect, useRef, useState } from "react";
import { formatTime, timerSnapshot } from "../lib/stillpoint";

const PRESETS = [25, 45, 60] as const;

type FocusTimerProps = {
  intention: string;
  onIntentionChange: (value: string) => void;
  onComplete: (minutes: number) => void;
  onDurationChange: (minutes: 25 | 45 | 60) => void;
  initialDuration: number;
};

export function FocusTimer({
  intention,
  onIntentionChange,
  onComplete,
  onDurationChange,
  initialDuration,
}: FocusTimerProps) {
  const safeInitialDuration = PRESETS.includes(initialDuration as (typeof PRESETS)[number])
    ? initialDuration
    : 25;
  const [duration, setDuration] = useState(safeInitialDuration);
  const [remaining, setRemaining] = useState(safeInitialDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState("Bereit, wenn du es bist.");
  const endAt = useRef<number | null>(null);
  const completed = useRef(false);

  useEffect(() => {
    if (!isRunning || !endAt.current) return;

    const tick = () => {
      const snapshot = timerSnapshot(endAt.current!, Date.now(), completed.current);
      setRemaining(snapshot.remaining);
      if (snapshot.remaining === 0) {
        setIsRunning(false);
        endAt.current = null;
        if (snapshot.shouldComplete) {
          completed.current = true;
          onComplete(duration);
          setMessage(`Stark. ${duration} Minuten Fokus sind für heute verbucht.`);
        }
      }
    };

    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [duration, isRunning, onComplete]);

  useEffect(() => {
    const defaultTitle = "Stillpoint — Fokus, der sich gut anfühlt";
    document.title = isRunning ? `${formatTime(remaining)} · Stillpoint` : defaultTitle;
    return () => {
      document.title = defaultTitle;
    };
  }, [isRunning, remaining]);

  const selectDuration = (minutes: (typeof PRESETS)[number]) => {
    setDuration(minutes);
    setRemaining(minutes * 60);
    setIsRunning(false);
    endAt.current = null;
    completed.current = false;
    onDurationChange(minutes);
    setMessage(`${minutes} Minuten sind eingestellt.`);
  };

  const toggleTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      endAt.current = null;
      setMessage("Pausiert. Dein Stand bleibt erhalten.");
      return;
    }
    const nextRemaining = remaining === 0 ? duration * 60 : remaining;
    setRemaining(nextRemaining);
    endAt.current = Date.now() + nextRemaining * 1000;
    completed.current = false;
    setIsRunning(true);
    setMessage("Fokus läuft. Ein Schritt nach dem anderen.");
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemaining(duration * 60);
    endAt.current = null;
    completed.current = false;
    setMessage("Timer zurückgesetzt.");
  };

  const progress = 1 - remaining / (duration * 60);

  return (
    <section className="focus-card" aria-labelledby="focus-title">
      <div className="card-topline">
        <p id="focus-title">Fokusraum</p>
        <span className={isRunning ? "status running" : "status"}>
          <i /> {isRunning ? "läuft" : remaining === 0 ? "fertig" : "bereit"}
        </span>
      </div>
      <div
        className="timer-ring"
        style={{ "--timer-progress": `${progress * 100}%` } as React.CSSProperties}
      >
        <div
          className="timer"
          role="timer"
          aria-label={`${formatTime(remaining)} verbleibend`}
          aria-live="off"
        >
          {formatTime(remaining)}
        </div>
      </div>
      <label className="focus-label" htmlFor="focus-intention">
        Was verdient jetzt deine Aufmerksamkeit?
      </label>
      <input
        id="focus-intention"
        className="focus-input"
        value={intention}
        onChange={(event) => onIntentionChange(event.target.value)}
        placeholder="Eine klare Aufgabe …"
        maxLength={180}
        autoComplete="off"
      />
      <div className="duration-row" role="group" aria-label="Fokusdauer wählen">
        {PRESETS.map((minutes) => (
          <button
            className={duration === minutes ? "duration active" : "duration"}
            key={minutes}
            onClick={() => selectDuration(minutes)}
            type="button"
            aria-pressed={duration === minutes}
          >
            {minutes} min
          </button>
        ))}
      </div>
      <div className="timer-actions">
        <button className="start-button" type="button" onClick={toggleTimer}>
          <span>{isRunning ? "Pause" : remaining === 0 ? "Nochmal" : "Session starten"}</span>
          <span aria-hidden="true">{isRunning ? "Ⅱ" : "→"}</span>
        </button>
        <button className="reset-button" type="button" onClick={resetTimer} aria-label="Timer zurücksetzen">
          ↺
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{message}</p>
    </section>
  );
}
