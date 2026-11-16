'use client';

import { useEffect, useState } from 'react';
import { ConnectionState } from 'livekit-client';
import { useSessionContext } from '@livekit/components-react';
import { Button } from '@/components/ui/button';

// Module scope, not a ref: this component remounts after every call ends, and a fresh ref
// would redial (and re-prompt for the mic) in a loop.
let autoStarted = false;

/**
 * Shown while not in a call. Logging in starts the call right away (once per page load);
 * after the learner hangs up, a button starts the next one instead of redialling by itself.
 */
export function CallStarter() {
  const { connectionState, start } = useSessionContext();
  const [started, setStarted] = useState(autoStarted);

  useEffect(() => {
    if (autoStarted) return;

    autoStarted = true;
    setStarted(true);
    start();
  }, [start]);

  if (connectionState === ConnectionState.Connecting || !started) {
    return <p className="text-muted-foreground text-sm">Connecting to your tutor…</p>;
  }

  return (
    <Button size="lg" onClick={() => start()} className="rounded-full">
      Start a new lesson
    </Button>
  );
}
