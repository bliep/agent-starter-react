'use client';

import { DrillPanel } from '@/components/app/drill-panel';
import { FeedbackPanel } from '@/components/app/feedback-panel';
import { cn } from '@/lib/shadcn/utils';
import { type ModeRequest, isDrill } from '@/lib/tutor-drill';

/**
 * Main area of the call screen: feedback (corrections, new words) in conversation and
 * role-play, drill progress in drills. Both stay mounted so switching keeps their history.
 */
export function LessonPanels({ request, className }: { request: ModeRequest; className?: string }) {
  const drilling = isDrill(request.mode);

  return (
    <div className={cn('flex flex-col', className)}>
      <FeedbackPanel className={drilling ? 'hidden' : undefined} />
      <DrillPanel mode={request.mode} className={drilling ? undefined : 'hidden'} />
    </div>
  );
}
