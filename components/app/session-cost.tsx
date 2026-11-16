'use client';

import { useSessionCost } from '@/hooks/use-session-cost';
import { cn } from '@/lib/shadcn/utils';

function usd(amount: number, digits = 2): string {
  return `$${amount.toFixed(digits)}`;
}

/**
 * Running cost of the current call:
 *   $0.18 · 14.1 min · $0.013/min
 *   livekit $0.148 · deepgram nova-3 $0.021 · claude-sonnet-5-5 $0.009 · …
 * Lines sorted by cost; services still at $0 are left out.
 */
export function SessionCost({ className }: { className?: string }) {
  const cost = useSessionCost();
  if (!cost) return null;

  const lines = Object.entries(cost.models ?? {})
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className={cn('text-muted-foreground text-right text-xs tabular-nums', className)}>
      <p>
        {usd(cost.total)} · {cost.minutes.toFixed(1)} min · {usd(cost.per_minute, 3)}/min
      </p>
      <p className="max-w-md text-[0.65rem] leading-tight">
        {lines.map(([line, amount]) => `${line} ${usd(amount, 3)}`).join(' · ')}
      </p>
    </div>
  );
}
