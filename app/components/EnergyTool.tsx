"use client";

import {
  ENERGY_RECOMMENDATIONS,
  type EnergyLevel,
} from "../lib/stillpoint";

const LEVELS: Array<{ value: EnergyLevel; label: string; glyph: string }> = [
  { value: "low", label: "Leise", glyph: "○" },
  { value: "steady", label: "Stabil", glyph: "◐" },
  { value: "high", label: "Wach", glyph: "●" },
];

type EnergyToolProps = {
  value: EnergyLevel | null;
  onChange: (value: EnergyLevel) => void;
  onUseDuration: (duration: 25 | 45 | 60) => void;
};

export function EnergyTool({ value, onChange, onUseDuration }: EnergyToolProps) {
  const recommendation = value ? ENERGY_RECOMMENDATIONS[value] : null;

  return (
    <article className="tool-card energy-card" data-reveal>
      <div className="tool-index">03 / ENERGIE</div>
      <div className="tool-copy">
        <p className="tool-kicker">Ehrlich einchecken</p>
        <h3>Wie viel ist heute da?</h3>
        <p>Nicht jeder Tag braucht denselben Plan. Wähle den Zustand, der gerade stimmt.</p>
      </div>
      <div className="energy-options" role="group" aria-label="Aktuelles Energieniveau">
        {LEVELS.map((level) => (
          <button
            type="button"
            key={level.value}
            className={value === level.value ? "energy-option selected" : "energy-option"}
            aria-pressed={value === level.value}
            onClick={() => onChange(level.value)}
          >
            <span aria-hidden="true">{level.glyph}</span>
            {level.label}
          </button>
        ))}
      </div>
      <div className={recommendation ? "recommendation visible" : "recommendation"} aria-live="polite">
        {recommendation ? (
          <>
            <div>
              <span>{recommendation.duration} min</span>
              <strong>{recommendation.title}</strong>
              <p>{recommendation.copy}</p>
            </div>
            <button
              type="button"
              onClick={() => onUseDuration(recommendation.duration)}
            >
              Übernehmen <span aria-hidden="true">→</span>
            </button>
          </>
        ) : (
          <p>Deine passende Fokuslänge erscheint hier.</p>
        )}
      </div>
    </article>
  );
}
