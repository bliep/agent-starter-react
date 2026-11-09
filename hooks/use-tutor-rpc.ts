'use client';

import { useMemo } from 'react';
import { useAgent, useSessionContext } from '@livekit/components-react';
import { TutorRpc } from '@/lib/tutor-rpc';

/** RPC client for the tutor agent; null until the agent has joined. */
export function useTutorRpc(): TutorRpc | null {
  const { room } = useSessionContext();
  const agent = useAgent();

  return useMemo(
    () => (agent.isConnected ? new TutorRpc(room, agent.identity) : null),
    [agent.isConnected, agent.identity, room]
  );
}
