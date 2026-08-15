"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useStillpointContext } from "./StillpointClient";

const EXAMPLE_NAMES = [
  "Mia",
  "Elias",
  "Aylin",
  "Noah",
  "Samira",
  "Mika",
  "Leonie",
  "Amir",
  "Sofia",
  "Ben",
  "Layla",
  "Finn",
  "Elif",
  "Luca",
  "Nila",
  "David",
  "Zoe",
  "Karim",
  "Clara",
  "Jun",
  "Imani",
  "Paul",
  "Yara",
  "Theo",
  "Rania",
  "Luis",
  "Ada",
  "Cem",
];

export function PersonalHeroIntro({ enabled }: { enabled: boolean }) {
  const { data, ready } = useStillpointContext();
  const name = enabled && ready ? data.profileName : "";

  if (enabled) {
    return (
      <p className="hero-intro" aria-live="polite">
        {name ? <>Schön, dass du da bist, <strong>{name}</strong>.</> : null}
      </p>
    );
  }

  return (
    <p className="hero-intro">
      Fokus, Energie und Fortschritt an einem Ort. Kostenlos, lokal gespeichert
      und ohne den Lärm klassischer Produktivitäts-Apps.
    </p>
  );
}

export function FirstRunOnboarding({ enabled }: { enabled: boolean }) {
  const { data, ready, setProfileName } = useStillpointContext();
  const [name, setName] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
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

  useEffect(() => {
    if (!shouldOpen) return;
    const nameLoop = window.setInterval(() => {
      setExampleIndex((current) => (current + 1) % EXAMPLE_NAMES.length);
    }, 1800);
    return () => window.clearInterval(nameLoop);
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
          placeholder={`Zum Beispiel ${EXAMPLE_NAMES[exampleIndex]}`}
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
