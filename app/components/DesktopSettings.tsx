"use client";

import { useEffect, useRef, useState } from "react";
import { type ReminderInterval } from "../lib/stillpoint";
import { useStillpointContext } from "./StillpointClient";

const REMINDER_INTERVALS: ReminderInterval[] = [30, 60, 90, 120];

export function DesktopSettings() {
  const { data, ready, setReminder } = useStillpointContext();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    window.stillpointDesktop?.setReminderPreferences(data.reminder);
  }, [data.reminder, ready]);

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
                    <span>{minutes < 60 ? `${minutes} min` : `${minutes / 60} h`}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <p className="settings-note">
              Stillpoint bleibt für aktive Erinnerungen im Windows-Infobereich erreichbar.
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
