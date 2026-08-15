"use client";

import { getWeeklySummary, type StillpointState } from "../lib/stillpoint";

export function WeeklyReview({ data }: { data: StillpointState }) {
  const summary = getWeeklySummary(data);

  const metrics = [
    { value: summary.totalMinutes, label: "Fokusminuten" },
    { value: summary.sessions, label: "Sessions" },
    { value: summary.focusDays, label: "Fokustage" },
    { value: summary.breaths, label: "Atempausen" },
  ];

  return (
    <section className="weekly-review" aria-labelledby="weekly-title">
      <div className="weekly-intro">
        <p>Deine letzten sieben Tage</p>
        <h3 id="weekly-title">Ein Muster,<br /><em>kein Urteil.</em></h3>
        <p>{summary.insight}</p>
      </div>

      <div className="weekly-metrics" aria-label="Wochenwerte">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>

      <dl className="weekly-patterns">
        <div><dt>Stärkster Tag</dt><dd>{summary.bestDayLabel}</dd></div>
        <div><dt>Bestes Zeitfenster</dt><dd>{summary.bestTimeLabel}</dd></div>
        <div><dt>Tragende Energie</dt><dd>{summary.energyLabel}</dd></div>
        <div><dt>Ø Session</dt><dd>{summary.averageMinutes ? `${summary.averageMinutes} min` : "Noch offen"}</dd></div>
      </dl>
    </section>
  );
}
