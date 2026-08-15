"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ReminderInterval,
  type SoundscapeKind,
  type SoundscapePreferences,
} from "../lib/stillpoint";
import { useStillpointContext } from "./StillpointClient";

const SOUNDSCAPES: Array<{ value: SoundscapeKind; label: string; description: string }> = [
  { value: "rain", label: "Regen", description: "Helles, gleichmäßiges Rauschen" },
  { value: "brown", label: "Tiefe Ruhe", description: "Warmes, tiefes Rauschen" },
  { value: "room", label: "Weicher Raum", description: "Sanfte, gedämpfte Atmosphäre" },
];

type AudioEngine = {
  context: AudioContext;
  source: AudioBufferSourceNode;
  gain: GainNode;
  extraNodes: AudioScheduledSourceNode[];
};

function noiseBuffer(context: AudioContext, kind: SoundscapeKind) {
  const length = context.sampleRate * 4;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  let brown = 0;
  let pink = 0;

  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;
    if (kind === "brown") {
      brown = (brown + 0.02 * white) / 1.02;
      channel[index] = brown * 3.2;
    } else if (kind === "room") {
      pink = pink * 0.985 + white * 0.015;
      channel[index] = pink * 2.5;
    } else {
      channel[index] = white * 0.7;
    }
  }
  return buffer;
}

function createAudioEngine(preferences: SoundscapePreferences) {
  const context = new AudioContext();
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const extraNodes: AudioScheduledSourceNode[] = [];

  source.buffer = noiseBuffer(context, preferences.kind);
  source.loop = true;
  filter.type = preferences.kind === "rain" ? "highpass" : "lowpass";
  filter.frequency.value = preferences.kind === "rain" ? 900 : preferences.kind === "brown" ? 850 : 1450;
  gain.gain.value = (preferences.volume / 100) * 0.32;
  source.connect(filter).connect(gain).connect(context.destination);

  if (preferences.kind === "room") {
    [72, 108].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const oscillatorGain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillatorGain.gain.value = index === 0 ? 0.008 : 0.004;
      oscillator.connect(oscillatorGain).connect(gain);
      oscillator.start();
      extraNodes.push(oscillator);
    });
  }

  source.start();
  return { context, source, gain, extraNodes };
}

export function SoundscapeTool() {
  const { data, setSoundscape } = useStillpointContext();
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState("Bereit");
  const engineRef = useRef<AudioEngine | null>(null);

  const stop = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    try {
      engine.source.stop();
      engine.extraNodes.forEach((node) => node.stop());
      void engine.context.close();
    } catch {
      // The browser may already have stopped an audio node during shutdown.
    }
    engineRef.current = null;
    setPlaying(false);
  }, []);

  const start = useCallback((preferences: SoundscapePreferences) => {
    stop();
    try {
      engineRef.current = createAudioEngine(preferences);
      setPlaying(true);
      setMessage("Klangraum läuft");
    } catch {
      setMessage("Klang konnte nicht gestartet werden");
    }
  }, [stop]);

  useEffect(() => stop, [stop]);

  const selectKind = (kind: SoundscapeKind) => {
    const preferences = { ...data.soundscape, kind };
    setSoundscape(preferences);
    if (playing) start(preferences);
  };

  const setVolume = (volume: number) => {
    setSoundscape({ ...data.soundscape, volume });
    const engine = engineRef.current;
    if (engine) {
      engine.gain.gain.setTargetAtTime((volume / 100) * 0.32, engine.context.currentTime, 0.05);
    }
  };

  return (
    <article className="tool-card soundscape-card" data-reveal>
      <div className="tool-copy">
        <p className="tool-kicker">Offline-Klangräume</p>
        <h3>Ruhe, die mitarbeitet.</h3>
        <p>Direkt im Gerät erzeugt – ohne Streaming, Konto oder externe Audiodateien.</p>
      </div>

      <div className={playing ? "sound-visual playing" : "sound-visual"} aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => <i key={index} />)}
      </div>

      <div className="sound-options" role="group" aria-label="Klangraum wählen">
        {SOUNDSCAPES.map((sound) => (
          <button
            type="button"
            key={sound.value}
            className={data.soundscape.kind === sound.value ? "selected" : ""}
            aria-pressed={data.soundscape.kind === sound.value}
            onClick={() => selectKind(sound.value)}
          >
            <strong>{sound.label}</strong><span>{sound.description}</span>
          </button>
        ))}
      </div>

      <div className="sound-controls">
        <label htmlFor="sound-volume">Lautstärke <span>{data.soundscape.volume}%</span></label>
        <input
          id="sound-volume"
          type="range"
          min="0"
          max="100"
          step="5"
          value={data.soundscape.volume}
          onChange={(event) => setVolume(Number(event.target.value))}
        />
        <button type="button" onClick={() => (playing ? stop() : start(data.soundscape))}>
          {playing ? "Klang stoppen" : "Klang starten"}
        </button>
      </div>
      <p className="sr-only" role="status">{message}</p>
    </article>
  );
}

const REMINDER_INTERVALS: ReminderInterval[] = [30, 60, 90, 120];

export function ReminderTool() {
  const { data, ready, setReminder } = useStillpointContext();

  useEffect(() => {
    if (!ready) return;
    window.stillpointDesktop?.setReminderPreferences(data.reminder);
  }, [data.reminder, ready]);

  return (
    <article className="tool-card reminder-card" data-reveal>
      <div className="tool-copy">
        <p className="tool-kicker">Sanfte Erinnerung</p>
        <h3>Nicht antreiben.<br />Zurückholen.</h3>
        <p>Eine ruhige Windows-Benachrichtigung – nur so oft, wie du es selbst bestimmst.</p>
      </div>

      <button
        className={data.reminder.enabled ? "reminder-switch active" : "reminder-switch"}
        type="button"
        role="switch"
        aria-checked={data.reminder.enabled}
        onClick={() => setReminder({ ...data.reminder, enabled: !data.reminder.enabled })}
      >
        <span aria-hidden="true"><i /></span>
        {data.reminder.enabled ? "Erinnerungen sind aktiv" : "Erinnerungen sind aus"}
      </button>

      <fieldset disabled={!data.reminder.enabled}>
        <legend>Wie oft?</legend>
        <div className="reminder-options">
          {REMINDER_INTERVALS.map((minutes) => (
            <label key={minutes}>
              <input
                type="radio"
                name="reminder-interval"
                value={minutes}
                checked={data.reminder.intervalMinutes === minutes}
                onChange={() => setReminder({ enabled: true, intervalMinutes: minutes })}
              />
              <span>{minutes < 60 ? `${minutes} min` : `${minutes / 60} h`}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="reminder-note">Stillpoint bleibt dafür im Windows-Infobereich erreichbar.</p>
    </article>
  );
}
