'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useTutorRpc } from '@/hooks/use-tutor-rpc';
import type { SessionSummary } from '@/lib/tutor-feedback';

/** Requests the end-of-session summary from the tutor agent on demand. */
export function useSessionSummary() {
  const rpc = useTutorRpc();
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const request = useCallback(async () => {
    if (!rpc) return;

    setIsLoading(true);
    try {
      setSummary(await rpc.sessionSummary());
    } catch (error) {
      toast.error(`Could not get the summary: ${String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [rpc]);

  const clear = useCallback(() => setSummary(null), []);

  return { summary, isLoading, isReady: rpc !== null, request, clear };
}
