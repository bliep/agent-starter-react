'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSessionContext } from '@livekit/components-react';
import { useTutorRpc } from '@/hooks/use-tutor-rpc';
import { LessonMode, type ModeRequest, Scenario } from '@/lib/tutor-drill';

const DEFAULT_REQUEST: ModeRequest = {
  mode: LessonMode.Conversation,
  scenario: Scenario.Restaurant,
};

/** Current lesson mode; every call starts in conversation. */
export function useLessonMode() {
  const { isConnected } = useSessionContext();
  const rpc = useTutorRpc();
  const [request, setRequest] = useState(DEFAULT_REQUEST);

  useEffect(() => {
    if (!isConnected) setRequest(DEFAULT_REQUEST);
  }, [isConnected]);

  const change = useCallback(
    async (next: ModeRequest) => {
      if (!rpc) return;

      const previous = request;
      setRequest(next);
      try {
        await rpc.setLessonMode(next);
      } catch (error) {
        setRequest(previous);
        toast.error(`Could not switch mode: ${String(error)}`);
      }
    },
    [rpc, request]
  );

  return { request, change, isReady: rpc !== null };
}
