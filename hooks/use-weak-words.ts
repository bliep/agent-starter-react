'use client';

import { useEffect, useState } from 'react';
import { useTutorRpc } from '@/hooks/use-tutor-rpc';
import type { WeakWord } from '@/lib/tutor-drill';

/** Weakest drilled words; refetched whenever `version` changes (e.g. after each result). */
export function useWeakWords(version: number): WeakWord[] {
  const rpc = useTutorRpc();
  const [words, setWords] = useState<WeakWord[]>([]);

  useEffect(() => {
    if (!rpc) return;

    let cancelled = false;
    rpc
      .wordScores()
      .then((next) => !cancelled && setWords(next))
      .catch((error) => console.warn('No word scores', error));
    return () => {
      cancelled = true;
    };
  }, [rpc, version]);

  return words;
}
