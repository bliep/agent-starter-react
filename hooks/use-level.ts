'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_LEVEL, Level, parseLevel } from '@/lib/tutor-level';

const STORAGE_KEY = 'tutor.level';

/** Learner's chosen level, remembered in this browser (best effort). */
export function useLevel(): [Level, (level: Level) => void] {
  const [level, setLevelState] = useState(DEFAULT_LEVEL);

  // Read after mount: localStorage is unavailable during server rendering.
  useEffect(() => {
    try {
      setLevelState(parseLevel(localStorage.getItem(STORAGE_KEY)));
    } catch {
      // Storage blocked (private mode, disabled site data): keep the default.
    }
  }, []);

  const setLevel = (next: Level) => {
    setLevelState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembered across visits; the session still uses it.
    }
  };

  return [level, setLevel];
}
