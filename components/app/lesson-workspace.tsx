'use client';

import { useSessionContext } from '@livekit/components-react';
import { DrillPanel } from '@/components/app/drill-panel';
import { FeedbackPanel } from '@/components/app/feedback-panel';
import { ModePicker } from '@/components/app/mode-picker';
import { useLessonMode } from '@/hooks/use-lesson-mode';
import { isDrill } from '@/lib/tutor-drill';

const PANEL_CLASSES = 'fixed top-20 right-4 bottom-36 z-40 hidden w-72 xl:flex';

/**
 * Mode picker and side panel during a call: feedback in conversation and role-play,
 * drill progress in drills. Both panels stay mounted so switching keeps their history.
 */
export function LessonWorkspace() {
  const { isConnected } = useSessionContext();
  const { request, change, isReady } = useLessonMode();
  if (!isConnected) return null;

  const drilling = isDrill(request.mode);
  return (
    <>
      <ModePicker
        request={request}
        onChange={change}
        disabled={!isReady}
        className="fixed top-4 right-4 z-50"
      />
      <FeedbackPanel className={drilling ? 'hidden' : PANEL_CLASSES} />
      <DrillPanel mode={request.mode} className={drilling ? PANEL_CLASSES : 'hidden'} />
    </>
  );
}
