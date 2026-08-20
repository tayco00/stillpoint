"use client";

import { useEffect, useRef, useState } from "react";
import { type ReminderInterval } from "../lib/stillpoint";
import { ProfileSettings } from "./ProfileSettings";
import { useStillpointContext } from "./StillpointClient";

const REMINDER_INTERVALS: ReminderInterval[] = [30, 60, 90, 120];

type UpdateStatus = {
  state: "idle" | "checking" | "available" | "downloading" | "ready" | "current" | "error";
  message: string;
  progress?: number;
};

const INITIAL_UPDATE_STATUS: UpdateStatus = {
  state: "idle",
  message: "Du kannst jederzeit manuell nach einer neuen Version suchen.",
};

export function DesktopSettings() {
  const {
    data,
    ready,
    setReminder,
    setCompletionSound,
    setFontScale,
  } = useStillpointContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>(INITIAL_UPDATE_STATUS);

  useEffect(() => {
    if (!ready) return;
    window.stillpointDesktop?.setReminderPreferences(data.reminder);
  }, [data.reminder, ready]);

  useEffect(() => {
    return window.stillpointDesktop?.onUpdateStatus(setUpdateStatus);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const openSettings = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setOpen(true);
  };

  const closeSettings = () => dialogRef.current?.close();

  const checkForUpdates = async () => {
    const desktop = window.stillpointDesktop;
    if (!desktop) return;
    setUpdateStatus({ state: "checking", message: "Stillpoint sucht nach Updates …" });
    setUpdateStatus(await desktop.checkForUpdates());
  };

  return (
    <>
      <button className="settings-trigger" type="button" onClick={openSettings}>
        Einstellungen
      </button>

      <dialog
        className="settings-dialog"
        ref={dialogRef}
        aria-labelledby="settings-title"
        aria-describedby="settings-description"
        onClose={() => setOpen(false)}
      >
        <div className="settings-panel">
          <div className="settings-heading">
            <div>
              <p>Stillpoint</p>
              <h2 id="settings-title">Einstellungen</h2>
            </div>
            <button type="button" onClick={closeSettings} aria-label="Einstellungen schließen">
              ×
            </button>
          </div>

          <p className="settings-description" id="settings-description">
            Wenige Optionen, die deinen Fokusraum im Hintergrund unterstützen.
          </p>

          <ProfileSettings />

          <section className="settings-card settings-display" aria-labelledby="display-title">
            <div className="settings-section-copy">
              <p>Darstellung</p>
              <h3 id="display-title">Schriftgröße</h3>
              <span>Vergrößert die gesamte Oberfläche und bleibt für dein Profil gespeichert.</span>
            </div>
            <div className="settings-choice" role="group" aria-label="Schriftgröße wählen">
              <button
                type="button"
                aria-pressed={data.fontScale === "standard"}
                onClick={() => setFontScale("standard")}
              >
                Standard
              </button>
              <button
                type="button"
                aria-pressed={data.fontScale === "large"}
                onClick={() => setFontScale("large")}
              >
                Groß
              </button>
            </div>
          </section>

          <section className="settings-card settings-sound" aria-labelledby="sound-title">
            <div className="settings-section-copy">
              <p>Timer</p>
              <h3 id="sound-title">Abschlusston</h3>
              <span>Ein sanfter Dreiklang macht das Ende deiner Fokuszeit hörbar.</span>
            </div>
            <button
              id="completion-sound-enabled"
              className={data.completionSound ? "settings-switch active" : "settings-switch"}
              type="button"
              role="switch"
              aria-checked={data.completionSound}
              onClick={() => setCompletionSound(!data.completionSound)}
            >
              <span aria-hidden="true"><i /></span>
              {data.completionSound ? "Aktiv" : "Aus"}
            </button>
          </section>

          <section className="settings-reminder" aria-labelledby="reminder-title">
            <div className="settings-section-copy">
              <p>Benachrichtigungen</p>
              <h3 id="reminder-title">Sanfte Erinnerung</h3>
              <span>Eine ruhige Windows-Nachricht – nur so oft, wie du es selbst bestimmst.</span>
            </div>

            <button
              id="reminder-enabled"
              className={data.reminder.enabled ? "settings-switch active" : "settings-switch"}
              type="button"
              role="switch"
              aria-checked={data.reminder.enabled}
              onClick={() => setReminder({ ...data.reminder, enabled: !data.reminder.enabled })}
            >
              <span aria-hidden="true"><i /></span>
              {data.reminder.enabled ? "Aktiv" : "Aus"}
            </button>

            <fieldset disabled={!data.reminder.enabled}>
              <legend>Erinnerungsabstand</legend>
              <div className="settings-options">
                {REMINDER_INTERVALS.map((minutes) => (
                  <label key={minutes}>
                    <input
                      type="radio"
                      name="settings-reminder-interval"
                      value={minutes}
                      checked={data.reminder.intervalMinutes === minutes}
                      onChange={() => setReminder({ enabled: true, intervalMinutes: minutes })}
                    />
                    <span>{minutes < 60 ? minutes + " min" : minutes / 60 + " h"}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <p className="settings-note">
              Stillpoint bleibt für aktive Erinnerungen im Windows-Infobereich erreichbar.
            </p>
          </section>

          <section className="settings-card settings-update" aria-labelledby="update-title">
            <div className="settings-section-copy">
              <p>Stillpoint</p>
              <h3 id="update-title">Aktualisierung</h3>
              <span>Prüfe den öffentlichen GitHub-Release-Kanal direkt aus der Anwendung.</span>
            </div>
            <div className="update-action">
              <button
                type="button"
                onClick={
                  updateStatus.state === "ready"
                    ? () => window.stillpointDesktop?.installReadyUpdate()
                    : () => void checkForUpdates()
                }
                disabled={["checking", "downloading"].includes(updateStatus.state)}
              >
                {updateStatus.state === "ready" ? "Update installieren" : "Nach Updates suchen"}
              </button>
              {updateStatus.state === "downloading" && updateStatus.progress !== undefined ? (
                <progress max="100" value={updateStatus.progress}>
                  {Math.round(updateStatus.progress)} %
                </progress>
              ) : null}
            </div>
            <p className="settings-note" aria-live="polite">
              {updateStatus.message}
            </p>
          </section>

          <button className="settings-done" type="button" onClick={closeSettings}>
            Fertig
          </button>
        </div>
      </dialog>
    </>
  );
}
