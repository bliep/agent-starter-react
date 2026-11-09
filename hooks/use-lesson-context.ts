'use client';

import { useEffect, useState } from 'react';
import { useTutorRpc } from '@/hooks/use-tutor-rpc';
import type { LessonContext } from '@/lib/tutor-feedback';

/** What this session practises (due words, recent mistakes); fetched once the agent joins. */
export function useLessonContext(): LessonContext | null {
  const rpc = useTutorRpc();
  const [lesson, setLesson] = useState<LessonContext | null>(null);

  useEffect(() => {
    if (!rpc) {
      setLesson(null);
      return;
    }

    let cancelled = false;
    rpc
      .lessonContext()
      .then((next) => !cancelled && setLesson(next))
      .catch((error) => console.warn('No lesson context', error));
    return () => {
      cancelled = true;
    };
  }, [rpc]);

  return lesson;
}
