"use client";

import { useMemo, useState } from "react";
import {
  getSessionHistory,
  type EnergyLevel,
  type StillpointState,
} from "../lib/stillpoint";

const PREVIEW_COUNT = 6;
const ENERGY_LABELS: Record<EnergyLevel, string> = {
  low: "Leise Energie",
  steady: "Stabile Energie",
  high: "Hohe Energie",
};

const DATE_FORMAT = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function SessionHistory({ data }: { data: StillpointState }) {
  const [expanded, setExpanded] = useState(false);
  const sessions = useMemo(() => getSessionHistory(data), [data]);
  const visibleSessions = expanded ? sessions : sessions.slice(0, PREVIEW_COUNT);

  return (
    <details className="session-history">
      <summary className="history-summary">
        <span className="history-summary-copy">
          <p>Sitzungshistorie</p>
          <strong>Vergangene Sitzungen</strong>
        </span>
        <span className="history-summary-meta">
          <span>{sessions.length} insgesamt</span>
          <i aria-hidden="true">↓</i>
        </span>
      </summary>

      <div className="history-content">
        {sessions.length === 0 ? (
          <div className="history-empty">
            <strong>Noch keine abgeschlossene Sitzung.</strong>
            <p>Nach deiner ersten Fokuszeit erscheint hier ein ruhiger Rückblick.</p>
          </div>
        ) : (
          <>
            <ol className="history-list">
              {visibleSessions.map((session) => {
                const completedAt = new Date(session.completedAt);
                return (
                  <li key={session.id}>
                    <div className="history-session-topline">
                      <time dateTime={completedAt.toISOString()}>
                        {DATE_FORMAT.format(completedAt)}
                      </time>
                      <strong>{session.minutes} min</strong>
                    </div>
                    <h4>{session.intention || "Fokuszeit ohne Titel"}</h4>
                    <div className="history-meta">
                      <span>{session.energy ? ENERGY_LABELS[session.energy] : "Energie nicht erfasst"}</span>
                    </div>
                    {session.outcome || session.nextStep ? (
                      <dl>
                        {session.outcome ? (
                          <div>
                            <dt>Bewegt</dt>
                            <dd>{session.outcome}</dd>
                          </div>
                        ) : null}
                        {session.nextStep ? (
                          <div>
                            <dt>Nächster Schritt</dt>
                            <dd>{session.nextStep}</dd>
                          </div>
                        ) : null}
                      </dl>
                    ) : (
                      <p className="history-no-review">Ohne Abschlussnotiz gespeichert.</p>
                    )}
                  </li>
                );
              })}
            </ol>

            {sessions.length > PREVIEW_COUNT ? (
              <button
                className="history-toggle"
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpanded((current) => !current)}
              >
                {expanded
                  ? "Weniger anzeigen"
                  : "Alle " + sessions.length + " Sitzungen anzeigen"}
              </button>
            ) : null}
          </>
        )}
      </div>
    </details>
  );
}
