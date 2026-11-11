'use client';

import { Button } from '@/components/ui/button';
import { TurnEnd, type usePushToTalk } from '@/hooks/use-push-to-talk';
import { cn } from '@/lib/shadcn/utils';
import { InputMode } from '@/lib/tutor-rpc';

/** Push-to-talk state, created once per call screen and shared by both controls below. */
export type PushToTalk = ReturnType<typeof usePushToTalk>;

const MODE_LABELS: Record<InputMode, string> = {
  [InputMode.Open]: 'Open mic',
  [InputMode.PushToTalk]: 'Push to talk',
};

/** Open mic / push-to-talk switch (top bar). */
export function InputModeSwitch({ ptt, className }: { ptt: PushToTalk; className?: string }) {
  return (
    <div
      role="radiogroup"
      aria-label="Input mode"
      className={cn('flex gap-1 rounded-lg border p-1', className)}
    >
      {Object.values(InputMode).map((value) => (
        <Button
          key={value}
          role="radio"
          aria-checked={ptt.mode === value}
          size="sm"
          variant={ptt.mode === value ? 'default' : 'ghost'}
          disabled={!ptt.isReady}
          onClick={() => ptt.setMode(value)}
        >
          {MODE_LABELS[value]}
        </Button>
      ))}
    </div>
  );
}

/** Hold-to-talk button (above the call controls); only in push-to-talk mode. */
export function HoldToTalkButton({ ptt, className }: { ptt: PushToTalk; className?: string }) {
  if (ptt.mode !== InputMode.PushToTalk) return null;

  return (
    <Button
      size="lg"
      variant={ptt.isTalking ? 'destructive' : 'outline'}
      className={cn('h-14 touch-none text-base select-none', className)}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        ptt.startTalking();
      }}
      onPointerUp={() => ptt.stopTalking(TurnEnd.Send)}
      onPointerCancel={() => ptt.stopTalking(TurnEnd.Cancel)}
      onContextMenu={(event) => event.preventDefault()}
    >
      {ptt.isTalking ? 'Listening… release to send' : 'Hold to talk (or hold space)'}
    </Button>
  );
}
