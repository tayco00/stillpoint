export const COMPLETION_TONE_NOTES = [
  { frequency: 523.25, delay: 0, duration: 0.9 },
  { frequency: 659.25, delay: 0.22, duration: 1.05 },
  { frequency: 783.99, delay: 0.48, duration: 1.35 },
] as const;

let audioContext: AudioContext | null = null;
let activeTone: {
  master: GainNode;
  oscillators: OscillatorNode[];
} | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return null;
  audioContext ??= new AudioContextClass();
  return audioContext;
}

export async function prepareCompletionTone() {
  const context = getAudioContext();
  if (context?.state === "suspended") {
    try {
      await context.resume();
    } catch {
      // A missing sound must never interrupt the timer.
    }
  }
}

function stopActiveTone(context: AudioContext) {
  if (!activeTone) return;
  const { master, oscillators } = activeTone;
  const now = context.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
  oscillators.forEach((oscillator) => {
    try {
      oscillator.stop(now + 0.04);
    } catch {
      // The oscillator may already have reached its scheduled end.
    }
  });
  activeTone = null;
}

export function playCompletionTone(volume = DEFAULT_COMPLETION_SOUND_VOLUME) {
  const context = getAudioContext();
  if (!context || context.state !== "running") return false;
  stopActiveTone(context);
  const start = context.currentTime + 0.04;
  const safeVolume = normalizeCompletionSoundVolume(volume);
  const master = context.createGain();
  const oscillators: OscillatorNode[] = [];
  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(0.32 * safeVolume, start + 0.08);
  master.gain.exponentialRampToValueAtTime(0.0001, start + 1.9);
  master.connect(context.destination);

  COMPLETION_TONE_NOTES.forEach((note) => {
    const oscillator = context.createOscillator();
    oscillators.push(oscillator);
    const noteGain = context.createGain();
    const noteStart = start + note.delay;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(note.frequency, noteStart);
    noteGain.gain.setValueAtTime(0.0001, noteStart);
    noteGain.gain.exponentialRampToValueAtTime(0.5, noteStart + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration);
    oscillator.connect(noteGain);
    noteGain.connect(master);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + note.duration + 0.05);
  });
  activeTone = { master, oscillators };
  window.setTimeout(() => {
    if (activeTone?.master === master) activeTone = null;
  }, 2_100);
  return true;
}
import {
  DEFAULT_COMPLETION_SOUND_VOLUME,
  normalizeCompletionSoundVolume,
} from "./stillpoint.ts";
