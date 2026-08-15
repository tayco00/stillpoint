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

  const recordSession = useCallback((minutes: number) => {
    setData((current) => addSession(current, minutes));
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
    if (!clean) return;
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    setData((current) => ({
      ...current,
      notes:
        current.notes.length >= MAX_NOTES
          ? current.notes
          : [...current.notes, { id, text: clean, createdAt: Date.now() }],
    }));
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
    setIntention,
    recordSession,
    recordBreath,
    setEnergy,
    setPreferredDuration,
    addNote,
    removeNote,
    setReflection,
    clearData,
    storageAvailable,
  };
}
