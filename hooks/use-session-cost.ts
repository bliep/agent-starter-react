'use client';

import { useEffect, useState } from 'react';
import { useTutorRpc } from '@/hooks/use-tutor-rpc';
import type { CostBreakdown } from '@/lib/tutor-rpc';

const REFRESH_MS = 30_000;

/** Running cost of the call, refreshed every 30 s. */
export function useSessionCost(): CostBreakdown | null {
  const rpc = useTutorRpc();
  const [cost, setCost] = useState<CostBreakdown | null>(null);

  useEffect(() => {
    if (!rpc) {
      setCost(null);
      return;
    }

    const refresh = () =>
      rpc
        .sessionCost()
        .then(setCost)
        .catch((error) => console.warn('No session cost', error));
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(timer);
  }, [rpc]);

  return cost;
}
