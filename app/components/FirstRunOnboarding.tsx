"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useStillpointContext } from "./StillpointClient";

export function PersonalHeroIntro({ enabled }: { enabled: boolean }) {
  const { data, ready } = useStillpointContext();
  const name = enabled && ready ? data.profileName : "";

  return (
    <p className="hero-intro" aria-live="polite">
      {name ? <>Schön, dass du da bist, <strong>{name}</strong>. </> : null}
      Fokus, Energie und Fortschritt an einem Ort. Kostenlos, lokal gespeichert
      und ohne den Lärm klassischer Produktivitäts-Apps.
    </p>
  );
}

export function FirstRunOnboarding({ enabled }: { enabled: boolean }) {
  const { data, ready, setProfileName } = useStillpointContext();
  const [name, setName] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldOpen = enabled && ready && !data.profileName;
  const cleanName = name.trim().replace(/\s+/g, " ");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!shouldOpen || !dialog) return;

    if (!dialog.open) dialog.showModal();
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [shouldOpen]);

  if (!shouldOpen) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cleanName) return;
    setProfileName(cleanName);
  };

  return (
    <dialog
      className="first-run-dialog"
      ref={dialogRef}
      aria-labelledby="first-run-title"
      aria-describedby="first-run-description first-run-privacy"
      onCancel={(event) => event.preventDefault()}
    >
      <form className="first-run-card" onSubmit={submit}>
        <span className="first-run-mark" aria-hidden="true" />
        <p className="first-run-kicker">Willkommen bei Stillpoint</p>
        <h2 id="first-run-title">Wie dürfen wir dich nennen?</h2>
        <p id="first-run-description">
          Ein Name macht deinen Fokusraum persönlicher. Vorname oder Spitzname genügt.
        </p>

        <label htmlFor="profile-name">Dein Name</label>
        <input
          id="profile-name"
          ref={inputRef}
          name="profileName"
          value={name}
          onChange={(event) => setName(event.target.value.slice(0, 40))}
          autoComplete="given-name"
          maxLength={40}
          placeholder="Zum Beispiel Taylan"
          required
        />

        <button type="submit" disabled={!cleanName}>
          Stillpoint öffnen <span aria-hidden="true">→</span>
        </button>
        <p className="first-run-privacy" id="first-run-privacy">
          Dein Name bleibt ausschließlich auf diesem Gerät.
        </p>
      </form>
    </dialog>
  );
}
