"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addBreathReset,
  addSession,
  createDefaultState,
  type EnergyLevel,
  type FontScale,
  localDateKey,
  MAX_NOTES,
  normalizeCompletionSoundVolume,
  readPersistedStateFrom,
  type ReminderPreferences,
  reviewLatestSession,
  STORAGE_KEY,
  type StillpointState,
} from "../lib/stillpoint";
import {
  cleanProfileName,
  createEmptyProfileStore,
  createProfile,
  MAX_PROFILES,
  PROFILE_STORAGE_KEY,
  readProfileStoreFrom,
  type ProfileStore,
  writeProfileStoreTo,
} from "../lib/profiles";

export function useStillpoint() {
  const [store, setStore] = useState<ProfileStore>(createEmptyProfileStore);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [profileSelectionRequired, setProfileSelectionRequired] = useState(false);

  const activeProfile = store.profiles.find(
    (profile) => profile.id === store.activeProfileId,
  );
  const data = useMemo(
    () => activeProfile?.state ?? createDefaultState(),
    [activeProfile],
  );

  useEffect(() => {
    const legacy = readPersistedStateFrom(() => window.localStorage);
    const persisted = readProfileStoreFrom(() => window.localStorage, legacy.state);
    const hydration = window.setTimeout(() => {
      setStore(persisted.store);
      setReady(true);
      setStorageAvailable(legacy.available && persisted.available);
      setProfileSelectionRequired(persisted.store.profiles.length > 1);
    }, 0);
    return () => window.clearTimeout(hydration);
  }, []);

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key !== PROFILE_STORAGE_KEY) return;
      const legacy = readPersistedStateFrom(() => window.localStorage);
      const persisted = readProfileStoreFrom(() => window.localStorage, legacy.state);
      setStore(persisted.store);
      setStorageAvailable(legacy.available && persisted.available);
    };
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const available = writeProfileStoreTo(() => window.localStorage, store);
    const statusUpdate = window.setTimeout(() => setStorageAvailable(available), 0);
    return () => window.clearTimeout(statusUpdate);
  }, [ready, store]);

  useEffect(() => {
    document.documentElement.dataset.fontScale = data.fontScale;
  }, [data.fontScale]);

  const updateActiveState = useCallback(
    (update: (current: StillpointState) => StillpointState) => {
      setStore((current) => ({
        ...current,
        profiles: current.profiles.map((profile) =>
          profile.id === current.activeProfileId
            ? { ...profile, state: update(profile.state) }
            : profile,
        ),
      }));
    },
    [],
  );

  const createLocalProfile = useCallback(
    (name: string) => {
      const cleanName = cleanProfileName(name);
      if (
        !cleanName ||
        store.profiles.length >= MAX_PROFILES ||
        store.profiles.some(
          (profile) =>
            profile.name.toLocaleLowerCase("de") === cleanName.toLocaleLowerCase("de"),
        )
      ) {
        return false;
      }
      const profile = createProfile(cleanName);
      setStore((current) => ({
        ...current,
        activeProfileId: profile.id,
        profiles: [...current.profiles, profile],
      }));
      setProfileSelectionRequired(false);
      return true;
    },
    [store.profiles],
  );

  const selectProfile = useCallback((profileId: string) => {
    setStore((current) =>
      current.profiles.some((profile) => profile.id === profileId)
        ? { ...current, activeProfileId: profileId }
        : current,
    );
    setProfileSelectionRequired(false);
  }, []);

  const requestProfileSelection = useCallback(() => {
    setProfileSelectionRequired(true);
  }, []);

  const deleteProfile = useCallback((profileId: string) => {
    setStore((current) => {
      if (current.profiles.length <= 1) return current;
      const profiles = current.profiles.filter((profile) => profile.id !== profileId);
      const activeProfileId = profiles.some(
        (profile) => profile.id === current.activeProfileId,
      )
        ? current.activeProfileId
        : profiles[0].id;
      return { ...current, profiles, activeProfileId };
    });
  }, []);

  const setIntention = useCallback((intention: string) => {
    updateActiveState((current) => ({ ...current, intention: intention.slice(0, 180) }));
  }, [updateActiveState]);

  const setNextStep = useCallback((nextStep: string) => {
    updateActiveState((current) => ({
      ...current,
      nextStep: nextStep.trim().slice(0, 180),
    }));
  }, [updateActiveState]);

  const recordSession = useCallback((minutes: number) => {
    updateActiveState((current) =>
      addSession(current, minutes, new Date(), {
        intention: current.intention,
        energy: current.lastEnergy,
      }),
    );
  }, [updateActiveState]);

  const completeSessionReview = useCallback((outcome: string, nextStep: string) => {
    updateActiveState((current) => reviewLatestSession(current, outcome, nextStep));
  }, [updateActiveState]);

  const recordBreath = useCallback(() => {
    updateActiveState((current) => addBreathReset(current));
  }, [updateActiveState]);

  const setEnergy = useCallback((lastEnergy: EnergyLevel) => {
    updateActiveState((current) => ({ ...current, lastEnergy }));
  }, [updateActiveState]);

  const setPreferredDuration = useCallback((preferredDuration: 25 | 45 | 60) => {
    updateActiveState((current) => ({ ...current, preferredDuration }));
  }, [updateActiveState]);

  const setCompletionSound = useCallback((completionSound: boolean) => {
    updateActiveState((current) => ({ ...current, completionSound }));
  }, [updateActiveState]);

  const setCompletionSoundVolume = useCallback((completionSoundVolume: number) => {
    updateActiveState((current) => ({
      ...current,
      completionSoundVolume: normalizeCompletionSoundVolume(completionSoundVolume),
    }));
  }, [updateActiveState]);

  const setFontScale = useCallback((fontScale: FontScale) => {
    updateActiveState((current) => ({ ...current, fontScale }));
  }, [updateActiveState]);

  const addNote = useCallback((text: string) => {
    const clean = text.trim().slice(0, 180);
    if (!clean) return null;
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    updateActiveState((current) => ({
      ...current,
      notes:
        current.notes.length >= MAX_NOTES
          ? current.notes
          : [...current.notes, { id, text: clean, createdAt: Date.now() }],
    }));
    return id;
  }, [updateActiveState]);

  const removeNote = useCallback((id: string) => {
    updateActiveState((current) => ({
      ...current,
      notes: current.notes.filter((note) => note.id !== id),
    }));
  }, [updateActiveState]);

  const setReflection = useCallback((text: string) => {
    updateActiveState((current) => ({
      ...current,
      reflection: { date: localDateKey(), text: text.slice(0, 500) },
    }));
  }, [updateActiveState]);

  const setReminder = useCallback((reminder: ReminderPreferences) => {
    updateActiveState((current) => ({ ...current, reminder }));
  }, [updateActiveState]);

  const clearData = useCallback(() => {
    try {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      setStorageAvailable(false);
    }
    setStore(createEmptyProfileStore());
    setProfileSelectionRequired(false);
  }, []);

  return {
    data,
    profiles: store.profiles.map(({ id, name, createdAt }) => ({ id, name, createdAt })),
    activeProfileId: store.activeProfileId,
    profileSelectionRequired,
    ready,
    createProfile: createLocalProfile,
    selectProfile,
    requestProfileSelection,
    deleteProfile,
    setNextStep,
    setIntention,
    recordSession,
    completeSessionReview,
    recordBreath,
    setEnergy,
    setPreferredDuration,
    setCompletionSound,
    setCompletionSoundVolume,
    setFontScale,
    addNote,
    removeNote,
    setReflection,
    setReminder,
    clearData,
    storageAvailable,
  };
}
