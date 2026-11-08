'use client';

import { useSessionContext } from '@livekit/components-react';
import { Button } from '@/components/ui/button';
import { TurnEnd, usePushToTalk } from '@/hooks/use-push-to-talk';
import { cn } from '@/lib/shadcn/utils';
import { InputMode } from '@/lib/tutor-rpc';

const MODE_LABELS: Record<InputMode, string> = {
  [InputMode.Open]: 'Open mic',
  [InputMode.PushToTalk]: 'Push to talk',
};

/** Input mode switch, plus a hold-to-talk button in push-to-talk mode. Hidden until connected. */
export function PushToTalkControls({ className }: { className?: string }) {
  const { isConnected } = useSessionContext();
  const { isReady, mode, setMode, isTalking, startTalking, stopTalking } = usePushToTalk();

  if (!isConnected) return null;

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div role="radiogroup" aria-label="Input mode" className="flex gap-1 rounded-lg border p-1">
        {Object.values(InputMode).map((value) => (
          <Button
            key={value}
            role="radio"
            aria-checked={mode === value}
            size="sm"
            variant={mode === value ? 'default' : 'ghost'}
            disabled={!isReady}
            onClick={() => setMode(value)}
          >
            {MODE_LABELS[value]}
          </Button>
        ))}
      </div>

      {mode === InputMode.PushToTalk && (
        <Button
          size="lg"
          variant={isTalking ? 'destructive' : 'outline'}
          className="touch-none select-none"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            startTalking();
          }}
          onPointerUp={() => stopTalking(TurnEnd.Send)}
          onPointerCancel={() => stopTalking(TurnEnd.Cancel)}
          onContextMenu={(event) => event.preventDefault()}
        >
          {isTalking ? 'Listening… release to send' : 'Hold to talk (or hold space)'}
        </Button>
      )}
    </div>
  );
}
