"use client";

import { getRecentDays, localDateKey, type StillpointState } from "../lib/stillpoint";
import { WeeklyReview } from "./WeeklyReview";

type RhythmSectionProps = {
  data: StillpointState;
  onReflectionChange: (value: string) => void;
  onClear: () => void;
  storageAvailable: boolean;
};

export function RhythmSection({
  data,
  onReflectionChange,
  onClear,
  storageAvailable,
}: RhythmSectionProps) {
  const days = getRecentDays(data);
  const today = data.days[localDateKey()] ?? { sessions: 0, minutes: 0, breaths: 0 };
  const maxMinutes = Math.max(60, ...days.map((day) => day.minutes));
  const reflection = data.reflection.date === localDateKey() ? data.reflection.text : "";

  const confirmClear = () => {
    if (window.confirm("Alle lokal gespeicherten Stillpoint-Daten löschen?")) onClear();
  };

  return (
    <section className="rhythm-section" id="rhythm" aria-labelledby="rhythm-title">
      <div className="section-heading light" data-reveal>
        <h2 id="rhythm-title">Fortschritt,<br /><em>ohne Druck.</em></h2>
        <p className="section-lede">Ein leiser Rückblick auf das, was du tatsächlich bewegt hast. Keine Rangliste, kein schlechtes Gewissen.</p>
      </div>

      <div className="rhythm-dashboard" data-reveal>
        <div className="today-stats">
          <p>Heute</p>
          <div>
            <span><strong>{today.sessions}</strong> Sessions</span>
            <span><strong>{today.minutes}</strong> Fokusminuten</span>
            <span><strong>{today.breaths}</strong> Atempausen</span>
          </div>
        </div>

        <div className="week-chart" role="group" aria-label="Fokusminuten der letzten sieben Tage">
          {days.map((day) => (
            <div
              className="chart-day"
              key={day.key}
              role="img"
              aria-label={`${day.label}: ${day.minutes} Fokusminuten`}
            >
              <span className="bar-value" aria-hidden="true">
                {day.minutes > 0 ? day.minutes : ""}
              </span>
              <div className="bar-track">
                <i style={{ height: `${Math.max(4, (day.minutes / maxMinutes) * 100)}%` }} />
              </div>
              <span aria-hidden="true">{day.label}</span>
            </div>
          ))}
        </div>

        <div className="reflection-card">
          <div>
            <p>Tagesnotiz</p>
            <h3>Was hat heute<br />einen Unterschied gemacht?</h3>
          </div>
          <label className="sr-only" htmlFor="reflection">Tagesreflexion</label>
          <textarea
            id="reflection"
            value={reflection}
            onChange={(event) => onReflectionChange(event.target.value)}
            placeholder="Ein Satz reicht …"
            maxLength={500}
          />
          <span className="saved-note" role="status">
            {storageAvailable ? "Lokal gespeichert" : "Nur für diese Sitzung gespeichert"}
          </span>
        </div>

        <WeeklyReview data={data} />
      </div>

      <div className="data-promise">
        <p><strong>Dein Raum bleibt deiner.</strong> Stillpoint sendet keine Aktivitätsdaten und braucht kein Konto.</p>
        <button type="button" onClick={confirmClear}>Lokale Daten löschen</button>
      </div>
    </section>
  );
}
