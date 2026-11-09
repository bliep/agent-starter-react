'use client';

import { useSessionCost } from '@/hooks/use-session-cost';
import { cn } from '@/lib/shadcn/utils';
import type { CostBreakdown } from '@/lib/tutor-rpc';

const PROVIDERS = ['claude', 'deepgram', 'cartesia', 'azure', 'livekit'] as const;

function usd(amount: number, digits = 2): string {
  return `$${amount.toFixed(digits)}`;
}

function breakdownTitle(cost: CostBreakdown): string {
  return PROVIDERS.map((p) => `${p} ${usd(cost[p], 3)}`).join(' · ');
}

/** "$0.12 · 4.1 min · $0.029/min" for the current call; per provider on hover. */
export function SessionCost({ className }: { className?: string }) {
  const cost = useSessionCost();
  if (!cost) return null;

  return (
    <p
      className={cn('text-muted-foreground text-xs tabular-nums', className)}
      title={breakdownTitle(cost)}
    >
      {usd(cost.total)} · {cost.minutes.toFixed(1)} min · {usd(cost.per_minute, 3)}/min
    </p>
  );
}
