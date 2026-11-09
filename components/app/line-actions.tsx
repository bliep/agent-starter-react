'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { ReceivedMessage } from '@livekit/components-react';
import { Button } from '@/components/ui/button';
import { useTutorRpc } from '@/hooks/use-tutor-rpc';

/** Listening support under a tutor line: hear it slowly, or see it in English. */
export function LineActions({ message }: { message: ReceivedMessage }) {
  const rpc = useTutorRpc();
  const [english, setEnglish] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  if (!rpc || !message.message.trim()) return null;

  async function translate() {
    if (!rpc || english) return;

    setIsTranslating(true);
    try {
      setEnglish(await rpc.translate(message.message));
    } catch (error) {
      toast.error(`Could not translate: ${String(error)}`);
    } finally {
      setIsTranslating(false);
    }
  }

  function replay() {
    rpc?.replaySlow(message.message).catch((error) => toast.error(`Could not replay: ${error}`));
  }

  return (
    <div className="flex flex-col gap-1 px-3">
      <div className="flex gap-1">
        <Button size="xs" variant="ghost" onClick={replay} aria-label="Replay slowly">
          Slow
        </Button>
        <Button
          size="xs"
          variant="ghost"
          onClick={translate}
          disabled={isTranslating}
          aria-label="Translate to English"
        >
          {isTranslating ? '…' : 'EN'}
        </Button>
      </div>
      {english && <p className="text-muted-foreground text-xs">{english}</p>}
    </div>
  );
}
