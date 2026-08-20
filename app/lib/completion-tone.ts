export const COMPLETION_TONE_NOTES = [
  { frequency: 523.25, delay: 0, duration: 0.9 },
  { frequency: 659.25, delay: 0.22, duration: 1.05 },
  { frequency: 783.99, delay: 0.48, duration: 1.35 },
] as const;

let audioContext: AudioContext | null = null;

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

export function playCompletionTone() {
  const context = getAudioContext();
  if (!context || context.state !== "running") return false;
  const start = context.currentTime + 0.04;
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(0.24, start + 0.08);
  master.gain.exponentialRampToValueAtTime(0.0001, start + 1.9);
  master.connect(context.destination);

  COMPLETION_TONE_NOTES.forEach((note) => {
    const oscillator = context.createOscillator();
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
  return true;
}
