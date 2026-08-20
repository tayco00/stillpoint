import {
  createDefaultState,
  normalizeState,
  type StillpointState,
} from "./stillpoint.ts";

export const PROFILE_STORAGE_KEY = "stillpoint:profiles:v1";
export const PROFILE_STORE_VERSION = 1 as const;
export const MAX_PROFILES = 8;

export type LocalProfile = {
  id: string;
  name: string;
  createdAt: number;
  state: StillpointState;
};

export type ProfileStore = {
  version: typeof PROFILE_STORE_VERSION;
  activeProfileId: string;
  profiles: LocalProfile[];
};

type ReadableStorage = { getItem: (key: string) => string | null };
type WritableStorage = { setItem: (key: string, value: string) => void };

export function createEmptyProfileStore(): ProfileStore {
  return { version: PROFILE_STORE_VERSION, activeProfileId: "", profiles: [] };
}

export function cleanProfileName(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, 40);
}

export function createProfile(name: string, now = Date.now()): LocalProfile {
  const cleanName = cleanProfileName(name);
  const state = createDefaultState();
  state.profileName = cleanName;
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `${now}-${Math.random().toString(36).slice(2)}`,
    name: cleanName,
    createdAt: now,
    state,
  };
}

export function normalizeProfileStore(value: unknown): ProfileStore {
  if (!value || typeof value !== "object") return createEmptyProfileStore();
  const candidate = value as Partial<ProfileStore>;
  if (!Array.isArray(candidate.profiles)) return createEmptyProfileStore();

  const seen = new Set<string>();
  const profiles = candidate.profiles
    .filter((profile): profile is LocalProfile => Boolean(profile && typeof profile === "object"))
    .map((profile) => {
      const id = typeof profile.id === "string" ? profile.id.slice(0, 100) : "";
      const state = normalizeState(profile.state);
      const name = cleanProfileName(
        typeof profile.name === "string" ? profile.name : state.profileName,
      );
      return {
        id,
        name,
        createdAt:
          typeof profile.createdAt === "number" && Number.isFinite(profile.createdAt)
            ? profile.createdAt
            : 0,
        state: { ...state, profileName: name },
      };
    })
    .filter((profile) => {
      if (!profile.id || !profile.name || seen.has(profile.id)) return false;
      seen.add(profile.id);
      return true;
    })
    .slice(0, MAX_PROFILES);

  const requestedActive =
    typeof candidate.activeProfileId === "string" ? candidate.activeProfileId : "";
  const activeProfileId = profiles.some((profile) => profile.id === requestedActive)
    ? requestedActive
    : (profiles[0]?.id ?? "");

  return { version: PROFILE_STORE_VERSION, activeProfileId, profiles };
}

export function migrateLegacyState(state: StillpointState, now = Date.now()): ProfileStore {
  const normalized = normalizeState(state);
  if (!normalized.profileName) return createEmptyProfileStore();
  const profile = createProfile(normalized.profileName, now);
  profile.state = { ...normalized, profileName: profile.name };
  return {
    version: PROFILE_STORE_VERSION,
    activeProfileId: profile.id,
    profiles: [profile],
  };
}

export function readProfileStore(storage: ReadableStorage, legacyState: StillpointState) {
  try {
    const stored = storage.getItem(PROFILE_STORAGE_KEY);
    return {
      store: stored ? normalizeProfileStore(JSON.parse(stored)) : migrateLegacyState(legacyState),
      available: true,
    };
  } catch {
    return { store: migrateLegacyState(legacyState), available: false };
  }
}

export function readProfileStoreFrom(
  getStorage: () => ReadableStorage,
  legacyState: StillpointState,
) {
  try {
    return readProfileStore(getStorage(), legacyState);
  } catch {
    return { store: migrateLegacyState(legacyState), available: false };
  }
}

export function writeProfileStore(storage: WritableStorage, store: ProfileStore) {
  try {
    storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(normalizeProfileStore(store)));
    return true;
  } catch {
    return false;
  }
}

export function writeProfileStoreTo(
  getStorage: () => WritableStorage,
  store: ProfileStore,
) {
  try {
    return writeProfileStore(getStorage(), store);
  } catch {
    return false;
  }
}
