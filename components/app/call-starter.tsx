'use client';

import { useEffect, useRef } from 'react';
import { ConnectionState } from 'livekit-client';
import { useSessionContext } from '@livekit/components-react';
import { Button } from '@/components/ui/button';

/**
 * Shown while not in a call. Logging in starts the call right away (once per page load);
 * after the learner hangs up, a button starts the next one instead of redialling by itself.
 */
export function CallStarter() {
  const { connectionState, start } = useSessionContext();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;

    started.current = true;
    start();
  }, [start]);

  if (connectionState === ConnectionState.Connecting || !started.current) {
    return <p className="text-muted-foreground text-sm">Connecting to your tutor…</p>;
  }

  return (
    <Button size="lg" onClick={() => start()} className="rounded-full">
      Start a new lesson
    </Button>
  );
}
