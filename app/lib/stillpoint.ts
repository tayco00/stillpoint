export const STORAGE_KEY = "stillpoint:v1";
export const STATE_VERSION = 1 as const;
export const MAX_NOTES = 20;

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

export type StillpointState = {
  version: typeof STATE_VERSION;
  intention: string;
  notes: DistractionNote[];
  days: Record<string, DayStats>;
  reflection: { date: string; text: string };
  lastEnergy: EnergyLevel | null;
  preferredDuration: 25 | 45 | 60;
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
    intention: "",
    notes: [],
    days: {},
    reflection: { date: "", text: "" },
    lastEnergy: null,
    preferredDuration: 25,
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

  const reflection = candidate.reflection;
  const lastEnergy = ["low", "steady", "high"].includes(candidate.lastEnergy ?? "")
    ? (candidate.lastEnergy as EnergyLevel)
    : null;

  return {
    version: STATE_VERSION,
    intention: typeof candidate.intention === "string" ? candidate.intention.slice(0, 180) : "",
    notes,
    days,
    reflection:
      reflection && typeof reflection.date === "string" && typeof reflection.text === "string"
        ? { date: reflection.date, text: reflection.text.slice(0, 500) }
        : fallback.reflection,
    lastEnergy,
    preferredDuration: [25, 45, 60].includes(candidate.preferredDuration ?? 0)
      ? (candidate.preferredDuration as 25 | 45 | 60)
      : fallback.preferredDuration,
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

export function addSession(state: StillpointState, minutes: number, date = new Date()) {
  const key = localDateKey(date);
  const current = normalizeDay(state.days[key]);
  return {
    ...state,
    days: {
      ...state.days,
      [key]: {
        ...current,
        sessions: current.sessions + 1,
        minutes: current.minutes + finiteCount(minutes),
      },
    },
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
