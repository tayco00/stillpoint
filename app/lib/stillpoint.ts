export const STORAGE_KEY = "stillpoint:v1";
export const STATE_VERSION = 2 as const;
export const MAX_NOTES = 20;
export const MAX_SESSION_HISTORY = 180;

export type EnergyLevel = "low" | "steady" | "high";

export type DayStats = {
  sessions: number;
  minutes: number;
  breaths: number;
};

export type DistractionNote = {
  id: string;
  text: string;
  createdAt: number;
};

export type SessionRecord = {
  id: string;
  completedAt: number;
  minutes: number;
  intention: string;
  energy: EnergyLevel | null;
  outcome: string;
};

export type ReminderInterval = 30 | 60 | 90 | 120;
export type SoundscapeKind = "rain" | "brown" | "room";

export type ReminderPreferences = {
  enabled: boolean;
  intervalMinutes: ReminderInterval;
};

export type SoundscapePreferences = {
  kind: SoundscapeKind;
  volume: number;
};

export type StillpointState = {
  version: typeof STATE_VERSION;
  profileName: string;
  nextStep: string;
  intention: string;
  notes: DistractionNote[];
  sessionHistory: SessionRecord[];
  days: Record<string, DayStats>;
  reflection: { date: string; text: string };
  lastEnergy: EnergyLevel | null;
  preferredDuration: 25 | 45 | 60;
  reminder: ReminderPreferences;
  soundscape: SoundscapePreferences;
};

export type WeeklySummary = {
  totalMinutes: number;
  sessions: number;
  focusDays: number;
  breaths: number;
  averageMinutes: number;
  bestDayLabel: string;
  bestTimeLabel: string;
  energyLabel: string;
  insight: string;
};

export type EnergyRecommendation = {
  duration: 25 | 45 | 60;
  title: string;
  copy: string;
};

const EMPTY_DAY: DayStats = { sessions: 0, minutes: 0, breaths: 0 };

export function createDefaultState(): StillpointState {
  return {
    version: STATE_VERSION,
    profileName: "",
    nextStep: "",
    intention: "",
    notes: [],
    sessionHistory: [],
    days: {},
    reflection: { date: "", text: "" },
    lastEnergy: null,
    preferredDuration: 25,
    reminder: { enabled: false, intervalMinutes: 60 },
    soundscape: { kind: "rain", volume: 35 },
  };
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function finiteCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0;
}

function normalizeDay(value: unknown): DayStats {
  if (!value || typeof value !== "object") return { ...EMPTY_DAY };
  const day = value as Partial<DayStats>;
  return {
    sessions: finiteCount(day.sessions),
    minutes: finiteCount(day.minutes),
    breaths: finiteCount(day.breaths),
  };
}

export function normalizeState(value: unknown): StillpointState {
  const fallback = createDefaultState();
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<StillpointState>;
  const days: Record<string, DayStats> = {};

  if (candidate.days && typeof candidate.days === "object") {
    for (const [key, day] of Object.entries(candidate.days).slice(-90)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key)) days[key] = normalizeDay(day);
    }
  }

  const notes = Array.isArray(candidate.notes)
    ? candidate.notes
        .filter((note): note is DistractionNote =>
          Boolean(
            note &&
              typeof note.id === "string" &&
              typeof note.text === "string" &&
              typeof note.createdAt === "number",
          ),
        )
        .slice(-20)
        .map((note) => ({ ...note, text: note.text.slice(0, 180) }))
    : [];

  const sessionHistory = Array.isArray(candidate.sessionHistory)
    ? candidate.sessionHistory
        .filter((record): record is SessionRecord =>
          Boolean(
            record &&
              typeof record.id === "string" &&
              typeof record.completedAt === "number" &&
              Number.isFinite(record.completedAt) &&
              typeof record.minutes === "number",
          ),
        )
        .slice(-MAX_SESSION_HISTORY)
        .map((record) => ({
          id: record.id.slice(0, 80),
          completedAt: record.completedAt,
          minutes: finiteCount(record.minutes),
          intention: typeof record.intention === "string" ? record.intention.slice(0, 180) : "",
          energy: ["low", "steady", "high"].includes(record.energy ?? "")
            ? record.energy
            : null,
          outcome: typeof record.outcome === "string" ? record.outcome.slice(0, 300) : "",
        }))
    : [];

  const reflection = candidate.reflection;
  const lastEnergy = ["low", "steady", "high"].includes(candidate.lastEnergy ?? "")
    ? (candidate.lastEnergy as EnergyLevel)
    : null;
  const reminder = candidate.reminder;
  const soundscape = candidate.soundscape;
  const reminderInterval = [30, 60, 90, 120].includes(reminder?.intervalMinutes ?? 0)
    ? (reminder?.intervalMinutes as ReminderInterval)
    : fallback.reminder.intervalMinutes;
  const soundscapeKind = ["rain", "brown", "room"].includes(soundscape?.kind ?? "")
    ? (soundscape?.kind as SoundscapeKind)
    : fallback.soundscape.kind;

  return {
    version: STATE_VERSION,
    profileName:
      typeof candidate.profileName === "string"
        ? candidate.profileName.trim().slice(0, 40)
        : fallback.profileName,
    nextStep: typeof candidate.nextStep === "string" ? candidate.nextStep.slice(0, 180) : "",
    intention: typeof candidate.intention === "string" ? candidate.intention.slice(0, 180) : "",
    notes,
    sessionHistory,
    days,
    reflection:
      reflection && typeof reflection.date === "string" && typeof reflection.text === "string"
        ? { date: reflection.date, text: reflection.text.slice(0, 500) }
        : fallback.reflection,
    lastEnergy,
    preferredDuration: [25, 45, 60].includes(candidate.preferredDuration ?? 0)
      ? (candidate.preferredDuration as 25 | 45 | 60)
      : fallback.preferredDuration,
    reminder: {
      enabled: reminder?.enabled === true,
      intervalMinutes: reminderInterval,
    },
    soundscape: {
      kind: soundscapeKind,
      volume:
        typeof soundscape?.volume === "number" && Number.isFinite(soundscape.volume)
          ? Math.min(100, Math.max(0, Math.round(soundscape.volume)))
          : fallback.soundscape.volume,
    },
  };
}

type ReadableStorage = { getItem: (key: string) => string | null };
type WritableStorage = { setItem: (key: string, value: string) => void };

export function readPersistedState(storage: ReadableStorage) {
  try {
    const stored = storage.getItem(STORAGE_KEY);
    return {
      state: stored ? normalizeState(JSON.parse(stored)) : createDefaultState(),
      available: true,
    };
  } catch {
    return { state: createDefaultState(), available: false };
  }
}

export function readPersistedStateFrom(getStorage: () => ReadableStorage) {
  try {
    return readPersistedState(getStorage());
  } catch {
    return { state: createDefaultState(), available: false };
  }
}

export function writePersistedState(storage: WritableStorage, state: StillpointState) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function writePersistedStateTo(
  getStorage: () => WritableStorage,
  state: StillpointState,
) {
  try {
    return writePersistedState(getStorage(), state);
  } catch {
    return false;
  }
}

export function timerSnapshot(endAt: number, now: number, completionRecorded = false) {
  const remaining = Math.max(0, Math.ceil((endAt - now) / 1000));
  return { remaining, shouldComplete: remaining === 0 && !completionRecorded };
}

export function addSession(
  state: StillpointState,
  minutes: number,
  date = new Date(),
  details: { intention?: string; energy?: EnergyLevel | null } = {},
) {
  const key = localDateKey(date);
  const current = normalizeDay(state.days[key]);
  const safeMinutes = finiteCount(minutes);
  const record: SessionRecord = {
    id: `${date.getTime()}-${state.sessionHistory.length}`,
    completedAt: date.getTime(),
    minutes: safeMinutes,
    intention: (details.intention ?? "").slice(0, 180),
    energy: details.energy ?? null,
    outcome: "",
  };
  return {
    ...state,
    sessionHistory: [...state.sessionHistory, record].slice(-MAX_SESSION_HISTORY),
    days: {
      ...state.days,
      [key]: {
        ...current,
        sessions: current.sessions + 1,
        minutes: current.minutes + safeMinutes,
      },
    },
  };
}

export function reviewLatestSession(
  state: StillpointState,
  outcome: string,
  nextStep: string,
) {
  const cleanOutcome = outcome.trim().slice(0, 300);
  const cleanNextStep = nextStep.trim().slice(0, 180);
  const latestIndex = state.sessionHistory.length - 1;

  return {
    ...state,
    nextStep: cleanNextStep,
    sessionHistory: state.sessionHistory.map((record, index) =>
      index === latestIndex ? { ...record, outcome: cleanOutcome } : record,
    ),
  };
}

export function addBreathReset(state: StillpointState, date = new Date()) {
  const key = localDateKey(date);
  const current = normalizeDay(state.days[key]);
  return {
    ...state,
    days: { ...state.days, [key]: { ...current, breaths: current.breaths + 1 } },
  };
}

export function getRecentDays(state: StillpointState, count = 7, today = new Date()) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - 1 - index));
    const key = localDateKey(date);
    return {
      key,
      label: new Intl.DateTimeFormat("de-DE", { weekday: "short" })
        .format(date)
        .replace(".", ""),
      ...normalizeDay(state.days[key]),
    };
  });
}

function timeBucket(timestamp: number) {
  const hour = new Date(timestamp).getHours();
  if (hour >= 5 && hour < 12) return "Morgens";
  if (hour >= 12 && hour < 18) return "Nachmittags";
  return "Abends";
}

export function getWeeklySummary(state: StillpointState, today = new Date()): WeeklySummary {
  const days = getRecentDays(state, 7, today);
  const totalMinutes = days.reduce((sum, day) => sum + day.minutes, 0);
  const sessions = days.reduce((sum, day) => sum + day.sessions, 0);
  const breaths = days.reduce((sum, day) => sum + day.breaths, 0);
  const focusDays = days.filter((day) => day.minutes > 0).length;
  const bestDay = days.reduce((best, day) => (day.minutes > best.minutes ? day : best), days[0]);
  const dayKeys = new Set(days.map((day) => day.key));
  const recentSessions = state.sessionHistory.filter((record) =>
    dayKeys.has(localDateKey(new Date(record.completedAt))),
  );
  const timeTotals = new Map<string, number>();
  const energyTotals = new Map<EnergyLevel, number>();

  recentSessions.forEach((record) => {
    const bucket = timeBucket(record.completedAt);
    timeTotals.set(bucket, (timeTotals.get(bucket) ?? 0) + record.minutes);
    if (record.energy) {
      energyTotals.set(record.energy, (energyTotals.get(record.energy) ?? 0) + record.minutes);
    }
  });

  const bestTime = [...timeTotals].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Noch offen";
  const bestEnergy = [...energyTotals].sort((a, b) => b[1] - a[1])[0]?.[0];
  const energyLabel = bestEnergy
    ? { low: "Leise Energie", steady: "Stabile Energie", high: "Hohe Energie" }[bestEnergy]
    : "Noch offen";
  const averageMinutes = sessions > 0 ? Math.round(totalMinutes / sessions) : 0;

  let insight = "Eine erste Fokusphase reicht, damit Stillpoint ein Muster erkennen kann.";
  if (sessions > 0 && focusDays <= 2) {
    insight = `Deine Sessions dauern im Schnitt ${averageMinutes} Minuten. Ein weiterer ruhiger Fokustag würde den Rhythmus stabilisieren.`;
  } else if (focusDays >= 3 && bestTime !== "Noch offen") {
    insight = `${bestTime} entsteht aktuell dein stärkstes Fokusfenster. Schütze dort zuerst den wichtigsten Schritt.`;
  } else if (sessions > 0) {
    insight = `${focusDays} Fokustage zeigen bereits einen Rhythmus. Entscheidend ist die Wiederaufnahme, nicht eine perfekte Serie.`;
  }

  return {
    totalMinutes,
    sessions,
    focusDays,
    breaths,
    averageMinutes,
    bestDayLabel: bestDay.minutes > 0 ? bestDay.label : "Noch offen",
    bestTimeLabel: bestTime,
    energyLabel,
    insight,
  };
}

export const ENERGY_RECOMMENDATIONS: Record<EnergyLevel, EnergyRecommendation> = {
  low: {
    duration: 25,
    title: "Klein anfangen",
    copy: "Wähle einen sichtbaren ersten Schritt. Danach darfst du neu entscheiden.",
  },
  steady: {
    duration: 45,
    title: "In die Tiefe",
    copy: "Genug Ruhe für anspruchsvolle Arbeit, ohne deine Energie zu überziehen.",
  },
  high: {
    duration: 60,
    title: "Das Fenster nutzen",
    copy: "Schirme eine volle Stunde ab und nimm dir die schwierigste Aufgabe zuerst.",
  },
};

export function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
