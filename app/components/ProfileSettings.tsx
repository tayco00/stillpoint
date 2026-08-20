"use client";

import { useState, type FormEvent } from "react";
import { MAX_PROFILES } from "../lib/profiles";
import { useStillpointContext } from "./StillpointClient";

export function ProfileSettings() {
  const {
    profiles,
    activeProfileId,
    createProfile,
    selectProfile,
    deleteProfile,
  } = useStillpointContext();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const cleanName = name.trim().replace(/\s+/g, " ");

  const addProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cleanName) return;
    if (!createProfile(cleanName)) {
      setMessage(
        profiles.length >= MAX_PROFILES
          ? "Maximal " + MAX_PROFILES + " Profile sind möglich."
          : "Dieser Profilname ist bereits vergeben.",
      );
      return;
    }
    setName("");
    setMessage(cleanName + " ist jetzt aktiv.");
  };

  const removeProfile = (profileId: string, profileName: string) => {
    if (
      !window.confirm(
        "Profil „" + profileName + "“ und die dazugehörigen lokalen Daten wirklich löschen?",
      )
    ) {
      return;
    }
    deleteProfile(profileId);
    setMessage("Profil „" + profileName + "“ wurde gelöscht.");
  };

  return (
    <section className="profile-settings" aria-labelledby="profiles-title">
      <div className="settings-section-copy">
        <p>Personen</p>
        <h3 id="profiles-title">Profile</h3>
        <span>Jede Person behält ihren eigenen Fokusverlauf und ihre eigenen Einstellungen.</span>
      </div>

      <div className="profile-settings-list">
        {profiles.map((profile) => {
          const active = profile.id === activeProfileId;
          return (
            <div className={active ? "active" : ""} key={profile.id}>
              <button
                type="button"
                onClick={() => {
                  selectProfile(profile.id);
                  setMessage(profile.name + " ist jetzt aktiv.");
                }}
                aria-pressed={active}
              >
                <strong>{profile.name}</strong>
                <span>{active ? "Aktiv" : "Wechseln"}</span>
              </button>
              <button
                className="profile-delete"
                type="button"
                aria-label={"Profil " + profile.name + " löschen"}
                disabled={profiles.length <= 1}
                onClick={() => removeProfile(profile.id, profile.name)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <form className="profile-add" onSubmit={addProfile}>
        <label htmlFor="new-profile-name">Weiteres Profil</label>
        <div>
          <input
            id="new-profile-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value.slice(0, 40));
              setMessage("");
            }}
            placeholder="Name oder Spitzname"
            maxLength={40}
          />
          <button type="submit" disabled={!cleanName || profiles.length >= MAX_PROFILES}>
            Hinzufügen
          </button>
        </div>
      </form>
      <p className="settings-note" aria-live="polite">
        {message || profiles.length + " von " + MAX_PROFILES + " Profilen angelegt."}
      </p>
    </section>
  );
}
