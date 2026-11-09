'use client';

import { useState } from 'react';
import { DrillPanel } from '@/components/app/drill-panel';
import { FeedbackPanel } from '@/components/app/feedback-panel';
import { SessionCost } from '@/components/app/session-cost';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shadcn/utils';
import { type ModeRequest, isDrill } from '@/lib/tutor-drill';

// Wide screens: a column on the right. Phones: a drawer over the transcript.
const PANEL_POSITION =
  'fixed z-40 inset-x-3 top-32 bottom-36 xl:inset-x-auto xl:right-4 xl:top-24 xl:w-72';

/**
 * Side panel during a call: feedback in conversation and role-play, drill progress in
 * drills. Both stay mounted so switching keeps their history. Below xl it is a drawer.
 */
export function LessonPanels({ request }: { request: ModeRequest }) {
  const [isOpen, setIsOpen] = useState(false);
  const drilling = isDrill(request.mode);
  const visible = cn(PANEL_POSITION, isOpen ? 'flex' : 'hidden xl:flex');

  return (
    <>
      <FeedbackPanel className={drilling ? 'hidden' : visible} />
      <DrillPanel mode={request.mode} className={drilling ? visible : 'hidden'} />
      <Button
        size="sm"
        variant={isOpen ? 'default' : 'outline'}
        onClick={() => setIsOpen((open) => !open)}
        className="fixed right-3 bottom-40 z-50 xl:hidden"
      >
        {isOpen ? 'Close' : drilling ? 'Drill' : 'Feedback'}
      </Button>
      {/* Phones: the top bar has no room for the cost line. */}
      <SessionCost className="fixed bottom-42 left-4 z-50 md:hidden" />
    </>
  );
}
