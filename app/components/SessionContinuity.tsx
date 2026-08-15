"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useStillpointContext } from "./StillpointClient";

export function ResumeCard() {
  const { data, ready, setIntention, setNextStep } = useStillpointContext();

  if (!ready || !data.nextStep) return null;

  const continueWithStep = () => {
    setIntention(data.nextStep);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector("#workspace")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  };

  return (
    <aside className="resume-card" aria-labelledby="resume-title">
      <div>
        <p id="resume-title">Weiter, wo du aufgehört hast</p>
        <strong>{data.nextStep}</strong>
      </div>
      <div className="resume-actions">
        <button type="button" onClick={continueWithStep}>Fortsetzen <span aria-hidden="true">→</span></button>
        <button type="button" onClick={() => setNextStep("")}>Erledigt</button>
      </div>
    </aside>
  );
}

type SessionRitualProps = {
  open: boolean;
  intention: string;
  onSave: (outcome: string, nextStep: string) => void;
  onDismiss: () => void;
};

export function SessionRitual({ open, intention, onSave, onDismiss }: SessionRitualProps) {
  const [outcome, setOutcome] = useState("");
  const [nextStep, setNextStep] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const outcomeRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    setOutcome("");
    setNextStep("");
    if (!dialog.open) dialog.showModal();
    window.setTimeout(() => outcomeRef.current?.focus(), 0);
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  if (!open) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!outcome.trim() && !nextStep.trim()) return;
    onSave(outcome, nextStep);
  };

  return (
    <dialog
      className="ritual-dialog"
      ref={dialogRef}
      aria-labelledby="ritual-title"
      aria-describedby="ritual-description"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
    >
      <form className="ritual-card" onSubmit={submit}>
        <p className="ritual-kicker">Session abgeschlossen</p>
        <h2 id="ritual-title">Kurz festhalten.<br /><em>Dann loslassen.</em></h2>
        <p id="ritual-description">
          {intention ? `Dein Fokus war: ${intention}` : "Ein kurzer Rückblick macht den Wiedereinstieg leichter."}
        </p>

        <label htmlFor="session-outcome">Was hast du bewegt?</label>
        <textarea
          id="session-outcome"
          ref={outcomeRef}
          value={outcome}
          onChange={(event) => setOutcome(event.target.value.slice(0, 300))}
          maxLength={300}
          placeholder="Ein Satz reicht …"
        />

        <label htmlFor="session-next-step">Was ist der nächste gute Schritt?</label>
        <input
          id="session-next-step"
          value={nextStep}
          onChange={(event) => setNextStep(event.target.value.slice(0, 180))}
          maxLength={180}
          placeholder="Beim nächsten Mal beginne ich mit …"
        />

        <div className="ritual-actions">
          <button type="submit" disabled={!outcome.trim() && !nextStep.trim()}>
            Rückblick speichern <span aria-hidden="true">→</span>
          </button>
          <button type="button" onClick={onDismiss}>Ohne Notiz schließen</button>
        </div>
      </form>
    </dialog>
  );
}
