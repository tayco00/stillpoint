import assert from "node:assert/strict";
import test from "node:test";
import {
  addBreathReset,
  addSession,
  createDefaultState,
  ENERGY_RECOMMENDATIONS,
  formatTime,
  getRecentDays,
  getWeeklySummary,
  localDateKey,
  normalizeState,
  readPersistedState,
  readPersistedStateFrom,
  reviewLatestSession,
  timerSnapshot,
  writePersistedState,
  writePersistedStateTo,
} from "../app/lib/stillpoint.ts";
import { COMPLETION_TONE_NOTES } from "../app/lib/completion-tone.ts";
import {
  createProfile,
  migrateLegacyState,
  normalizeProfileStore,
  readProfileStoreFrom,
  writeProfileStore,
} from "../app/lib/profiles.ts";

test("timer formatting is stable at boundaries", () => {
  assert.equal(formatTime(0), "00:00");
  assert.equal(formatTime(65), "01:05");
  assert.equal(formatTime(-10), "00:00");
});

test("wall-clock timer supports pause, resume, and exactly-once completion", () => {
  const firstDeadline = 25_000;
  const paused = timerSnapshot(firstDeadline, 5_250);
  assert.deepEqual(paused, { remaining: 20, shouldComplete: false });

  const resumedDeadline = 10_000 + paused.remaining * 1000;
  assert.equal(timerSnapshot(resumedDeadline, 29_001).remaining, 1);
  const completion = timerSnapshot(resumedDeadline, 30_000);
  assert.deepEqual(completion, { remaining: 0, shouldComplete: true });
  assert.deepEqual(timerSnapshot(resumedDeadline, 31_000, true), {
    remaining: 0,
    shouldComplete: false,
  });
});

test("invalid stored data falls back safely and clamps user content", () => {
  assert.deepEqual(normalizeState(null), createDefaultState());
  const normalized = normalizeState({
    intention: "x".repeat(300),
    notes: [{ id: "1", text: "y".repeat(300), createdAt: 1 }, { broken: true }],
    days: { "2026-08-15": { sessions: -4, minutes: 12.4, breaths: 2 } },
    lastEnergy: "impossible",
    preferredDuration: 90,
  });
  assert.equal(normalized.intention.length, 180);
  assert.equal(normalized.notes.length, 1);
  assert.equal(normalized.notes[0].text.length, 180);
  assert.deepEqual(normalized.days["2026-08-15"], { sessions: 0, minutes: 12, breaths: 2 });
  assert.equal(normalized.lastEnergy, null);
  assert.equal(normalized.preferredDuration, 25);
});

test("the selected focus duration survives state normalization", () => {
  assert.equal(normalizeState({ preferredDuration: 60 }).preferredDuration, 60);
});

test("display size and completion sound preferences survive normalization", () => {
  const personalized = normalizeState({ fontScale: "large", completionSound: false });
  assert.equal(personalized.fontScale, "large");
  assert.equal(personalized.completionSound, false);
  assert.equal(normalizeState({ fontScale: "huge" }).fontScale, "standard");
  assert.equal(normalizeState({}).completionSound, true);
});

test("the completion cue is a gentle ascending three-note chord", () => {
  assert.equal(COMPLETION_TONE_NOTES.length, 3);
  assert.ok(COMPLETION_TONE_NOTES[0].frequency < COMPLETION_TONE_NOTES[1].frequency);
  assert.ok(COMPLETION_TONE_NOTES[1].frequency < COMPLETION_TONE_NOTES[2].frequency);
  assert.ok(COMPLETION_TONE_NOTES.every((note) => note.duration < 1.5));
});

test("the local profile name survives reloads and is safely normalized", () => {
  assert.equal(normalizeState({ profileName: "  Taylan  " }).profileName, "Taylan");
  assert.equal(normalizeState({ profileName: "x".repeat(80) }).profileName.length, 40);
  assert.equal(normalizeState({}).profileName, "");
});

test("session reviews preserve the next step for the next launch", () => {
  const date = new Date(2026, 7, 15, 9, 30);
  const completed = addSession(createDefaultState(), 45, date, {
    intention: "Konzept fertigstellen",
    energy: "steady",
  });
  const reviewed = reviewLatestSession(
    completed,
    "Die Struktur steht.",
    "Die Einleitung schreiben",
  );
  assert.equal(reviewed.nextStep, "Die Einleitung schreiben");
  assert.equal(reviewed.sessionHistory[0].outcome, "Die Struktur steht.");
  assert.equal(reviewed.sessionHistory[0].energy, "steady");
});

test("weekly review finds the strongest local focus pattern", () => {
  const today = new Date(2026, 7, 15, 12);
  let state = addSession(createDefaultState(), 25, new Date(2026, 7, 13, 9), {
    energy: "steady",
  });
  state = addSession(state, 45, new Date(2026, 7, 14, 10), { energy: "steady" });
  state = addSession(state, 30, new Date(2026, 7, 15, 20), { energy: "low" });
  const summary = getWeeklySummary(state, today);
  assert.equal(summary.totalMinutes, 100);
  assert.equal(summary.sessions, 3);
  assert.equal(summary.focusDays, 3);
  assert.equal(summary.bestTimeLabel, "Morgens");
  assert.equal(summary.energyLabel, "Stabile Energie");
});

test("desktop reminder preferences are normalized to safe local values", () => {
  const normalized = normalizeState({
    reminder: { enabled: true, intervalMinutes: 999 },
    soundscape: { kind: "invalid", volume: 500 },
  });
  assert.deepEqual(normalized.reminder, { enabled: true, intervalMinutes: 60 });
  assert.equal("soundscape" in normalized, false);
});

test("unavailable and quota-full storage fail safely", () => {
  const unreadable = readPersistedState({
    getItem() {
      throw new Error("blocked");
    },
  });
  assert.equal(unreadable.available, false);
  assert.deepEqual(unreadable.state, createDefaultState());

  const saved = writePersistedState(
    {
      setItem() {
        throw new Error("quota full");
      },
    },
    createDefaultState(),
  );
  assert.equal(saved, false);

  const inaccessible = readPersistedStateFrom(() => {
    throw new DOMException("Storage policy", "SecurityError");
  });
  assert.equal(inaccessible.available, false);
  assert.equal(
    writePersistedStateTo(() => {
      throw new DOMException("Storage policy", "SecurityError");
    }, createDefaultState()),
    false,
  );
});

test("legacy single-person data migrates into the first local profile", () => {
  const legacy = {
    ...createDefaultState(),
    profileName: "Mia",
    intention: "Konzept abschließen",
  };
  const migrated = migrateLegacyState(legacy, 100);
  assert.equal(migrated.profiles.length, 1);
  assert.equal(migrated.profiles[0].name, "Mia");
  assert.equal(migrated.profiles[0].state.intention, "Konzept abschließen");
  assert.equal(migrated.activeProfileId, migrated.profiles[0].id);
});

test("profile normalization keeps local data separate and selects a valid profile", () => {
  const mia = createProfile("Mia", 1);
  const noah = createProfile("Noah", 2);
  mia.state.intention = "Text schreiben";
  noah.state.intention = "Skizze prüfen";
  const normalized = normalizeProfileStore({
    activeProfileId: "missing",
    profiles: [mia, noah],
  });
  assert.equal(normalized.activeProfileId, mia.id);
  assert.equal(normalized.profiles[0].state.intention, "Text schreiben");
  assert.equal(normalized.profiles[1].state.intention, "Skizze prüfen");
});

test("profile storage failures are contained without losing migrated session data", () => {
  const legacy = { ...createDefaultState(), profileName: "Aylin" };
  const read = readProfileStoreFrom(() => {
    throw new DOMException("Storage policy", "SecurityError");
  }, legacy);
  assert.equal(read.available, false);
  assert.equal(read.store.profiles[0].name, "Aylin");
  assert.equal(
    writeProfileStore({
      setItem() {
        throw new Error("quota full");
      },
    }, read.store),
    false,
  );
});

test("sessions and breath resets update only the selected local day", () => {
  const date = new Date(2026, 7, 15, 12);
  const withSession = addSession(createDefaultState(), 45, date);
  const withReset = addBreathReset(withSession, date);
  const key = localDateKey(date);
  assert.deepEqual(withReset.days[key], { sessions: 1, minutes: 45, breaths: 1 });
  assert.equal(Object.keys(withReset.days).length, 1);
});

test("energy recommendations map to the three supported focus lengths", () => {
  assert.deepEqual(
    Object.values(ENERGY_RECOMMENDATIONS).map((item) => item.duration),
    [25, 45, 60],
  );
});

test("recent history always returns seven ordered local days", () => {
  const today = new Date(2026, 7, 15, 12);
  const days = getRecentDays(createDefaultState(), 7, today);
  assert.equal(days.length, 7);
  assert.equal(days.at(-1)?.key, "2026-08-15");
  assert.equal(days[0].key, "2026-08-09");
});
