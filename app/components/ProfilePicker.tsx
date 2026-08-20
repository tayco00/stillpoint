"use client";

import { useEffect, useRef } from "react";
import { useStillpointContext } from "./StillpointClient";

export function ProfilePicker({ enabled }: { enabled: boolean }) {
  const {
    profiles,
    profileSelectionRequired,
    ready,
    selectProfile,
  } = useStillpointContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const shouldOpen = enabled && ready && profileSelectionRequired && profiles.length > 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!shouldOpen || !dialog) return;
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [shouldOpen]);

  if (!shouldOpen) return null;

  return (
    <dialog
      className="profile-picker"
      ref={dialogRef}
      aria-labelledby="profile-picker-title"
      aria-describedby="profile-picker-description"
      onCancel={(event) => event.preventDefault()}
    >
      <div className="profile-picker-card">
        <p>Willkommen zurück</p>
        <h2 id="profile-picker-title">Wer nutzt Stillpoint?</h2>
        <span id="profile-picker-description">
          Wähle dein Profil. Fortschritt, Notizen und Einstellungen bleiben getrennt.
        </span>
        <div className="profile-picker-list">
          {profiles.map((profile, index) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => selectProfile(profile.id)}
            >
              <i aria-hidden="true">{index + 1}</i>
              <strong>{profile.name}</strong>
              <span aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}
