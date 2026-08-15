"use client";

import { useState, type FormEvent } from "react";
import { MAX_NOTES, type DistractionNote } from "../lib/stillpoint";

type CaptureToolProps = {
  notes: DistractionNote[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
};

export function CaptureTool({ notes, onAdd, onRemove }: CaptureToolProps) {
  const [draft, setDraft] = useState("");
  const isFull = notes.length >= MAX_NOTES;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || isFull) return;
    onAdd(draft);
    setDraft("");
  };

  return (
    <article className="tool-card capture-card" data-reveal>
      <div className="tool-copy">
        <p className="tool-kicker">Gedanken parken</p>
        <h3>Nicht jetzt. Nicht weg.</h3>
        <p>Halte Ablenkungen kurz fest, ohne deinen Fokusraum zu verlassen.</p>
      </div>
      <form className="capture-form" onSubmit={submit}>
        <label className="sr-only" htmlFor="distraction">Ablenkenden Gedanken notieren</label>
        <input
          id="distraction"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={180}
          placeholder="Später: …"
          disabled={isFull}
        />
        <button type="submit" aria-label="Gedanken parken" disabled={isFull}>+</button>
      </form>
      <p className="note-limit" role="status">
        {isFull
          ? `Alle ${MAX_NOTES} Plätze sind belegt. Entferne einen Gedanken, bevor du einen neuen parkst.`
          : `${notes.length} von ${MAX_NOTES} Plätzen belegt.`}
      </p>
      <div className="capture-list" aria-live="polite">
        {notes.length === 0 ? (
          <p className="empty-note">Hier ist noch Platz. Das ist gut.</p>
        ) : (
          <ul>
            {notes.slice().reverse().map((note) => (
              <li key={note.id}>
                <span>{note.text}</span>
                <button type="button" onClick={() => onRemove(note.id)} aria-label={`„${note.text}“ entfernen`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
