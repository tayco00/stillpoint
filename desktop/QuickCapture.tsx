"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MAX_NOTES } from "../app/lib/stillpoint";
import { useStillpointContext } from "../app/components/StillpointClient";

export function QuickCapture() {
  const { data, ready, addNote, storageAvailable } = useStillpointContext();
  const [draft, setDraft] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [status, setStatus] = useState("Gedanke eingeben und mit Enter speichern.");
  const inputRef = useRef<HTMLInputElement>(null);
  const isFull = data.notes.length >= MAX_NOTES;

  useEffect(() => {
    if (ready) inputRef.current?.focus();
  }, [ready]);

  useEffect(() => {
    if (!pendingId || !data.notes.some((note) => note.id === pendingId)) return;
    const statusTimer = window.setTimeout(() => setStatus("Lokal gespeichert."), 0);
    const closeTimer = window.setTimeout(() => window.close(), 450);
    return () => {
      window.clearTimeout(statusTimer);
      window.clearTimeout(closeTimer);
    };
  }, [data.notes, pendingId]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") window.close();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || isFull || !ready) return;
    const id = addNote(draft);
    if (!id) return;
    setPendingId(id);
    setStatus("Wird lokal gespeichert …");
  };

  return (
    <main className="quick-capture-shell">
      <button className="quick-close" type="button" onClick={() => window.close()} aria-label="Schnellnotiz schließen">×</button>
      <p className="quick-brand">still<span>.</span></p>
      <div>
        <p className="quick-kicker">Schnellnotiz</p>
        <h1>Nicht jetzt.<br /><em>Nicht weg.</em></h1>
      </div>
      <form onSubmit={submit}>
        <label htmlFor="quick-note">Was möchtest du parken?</label>
        <div>
          <input
            id="quick-note"
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, 180))}
            maxLength={180}
            placeholder="Später: …"
            disabled={!ready || isFull || Boolean(pendingId)}
            autoComplete="off"
          />
          <button type="submit" disabled={!draft.trim() || !ready || isFull || Boolean(pendingId)}>
            Speichern <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
      <p className="quick-status" role="status">
        {isFull ? `Alle ${MAX_NOTES} Plätze sind belegt.` : storageAvailable ? status : "Nur für diese Sitzung gespeichert."}
      </p>
    </main>
  );
}
