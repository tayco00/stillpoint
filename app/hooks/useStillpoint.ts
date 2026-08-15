"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addBreathReset,
  addSession,
  createDefaultState,
  type EnergyLevel,
  localDateKey,
  MAX_NOTES,
  readPersistedStateFrom,
  type ReminderPreferences,
  reviewLatestSession,
  STORAGE_KEY,
  type StillpointState,
  writePersistedStateTo,
} from "../lib/stillpoint";

export function useStillpoint() {
  const [data, setData] = useState<StillpointState>(createDefaultState);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    const persisted = readPersistedStateFrom(() => window.localStorage);
    const hydration = window.setTimeout(() => {
      setData(persisted.state);
      setReady(true);
      setStorageAvailable(persisted.available);
    }, 0);
    return () => window.clearTimeout(hydration);
  }, []);

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const persisted = readPersistedStateFrom(() => window.localStorage);
      setData(persisted.state);
      setStorageAvailable(persisted.available);
    };
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const nextStorageAvailable = writePersistedStateTo(() => window.localStorage, data);
    const statusUpdate = window.setTimeout(
      () => setStorageAvailable(nextStorageAvailable),
      0,
    );
    return () => window.clearTimeout(statusUpdate);
  }, [data, ready]);

  const setIntention = useCallback((intention: string) => {
    setData((current) => ({ ...current, intention: intention.slice(0, 180) }));
  }, []);

  const setProfileName = useCallback((profileName: string) => {
    const cleanName = profileName.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!cleanName) return;
    setData((current) => ({ ...current, profileName: cleanName }));
  }, []);

  const setNextStep = useCallback((nextStep: string) => {
    setData((current) => ({ ...current, nextStep: nextStep.trim().slice(0, 180) }));
  }, []);

  const recordSession = useCallback((minutes: number) => {
    setData((current) =>
      addSession(current, minutes, new Date(), {
        intention: current.intention,
        energy: current.lastEnergy,
      }),
    );
  }, []);

  const completeSessionReview = useCallback((outcome: string, nextStep: string) => {
    setData((current) => reviewLatestSession(current, outcome, nextStep));
  }, []);

  const recordBreath = useCallback(() => {
    setData((current) => addBreathReset(current));
  }, []);

  const setEnergy = useCallback((lastEnergy: EnergyLevel) => {
    setData((current) => ({ ...current, lastEnergy }));
  }, []);

  const setPreferredDuration = useCallback((preferredDuration: 25 | 45 | 60) => {
    setData((current) => ({ ...current, preferredDuration }));
  }, []);

  const addNote = useCallback((text: string) => {
    const clean = text.trim().slice(0, 180);
    if (!clean) return null;
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setData((current) => ({
      ...current,
      notes:
        current.notes.length >= MAX_NOTES
          ? current.notes
          : [...current.notes, { id, text: clean, createdAt: Date.now() }],
    }));
    return id;
  }, []);

  const removeNote = useCallback((id: string) => {
    setData((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) }));
  }, []);

  const setReflection = useCallback((text: string) => {
    setData((current) => ({
      ...current,
      reflection: { date: localDateKey(), text: text.slice(0, 500) },
    }));
  }, []);

  const setReminder = useCallback((reminder: ReminderPreferences) => {
    setData((current) => ({ ...current, reminder }));
  }, []);

  const clearData = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The reset still applies to the current session.
      setStorageAvailable(false);
    }
    setData(createDefaultState());
  }, []);

  return {
    data,
    ready,
    setProfileName,
    setNextStep,
    setIntention,
    recordSession,
    completeSessionReview,
    recordBreath,
    setEnergy,
    setPreferredDuration,
    addNote,
    removeNote,
    setReflection,
    setReminder,
    clearData,
    storageAvailable,
  };
}
