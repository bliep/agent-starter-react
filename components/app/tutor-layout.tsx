'use client';

import { useSessionContext } from '@livekit/components-react';
import { ChatDock } from '@/components/app/chat-dock';
import { LessonPanels } from '@/components/app/lesson-workspace';
import { LevelPicker } from '@/components/app/level-picker';
import { ModePicker } from '@/components/app/mode-picker';
import { InputModeSwitch } from '@/components/app/push-to-talk';
import { SessionCost } from '@/components/app/session-cost';
import { SummaryOverlay } from '@/components/app/summary-overlay';
import { TodayOverlay } from '@/components/app/today-overlay';
import { ViewController } from '@/components/app/view-controller';
import { Button } from '@/components/ui/button';
import { useLessonMode } from '@/hooks/use-lesson-mode';
import { usePushToTalk } from '@/hooks/use-push-to-talk';
import { signOut } from '@/lib/auth';
import type { Level } from '@/lib/tutor-level';

interface TutorLayoutProps {
  level: Level;
  onLevelChange: (level: Level) => void;
}

/**
 * The call screen:
 *
 *   ┌ log out ── input mode ── today · summary · mode · cost ┐  one bar, wraps on phones
 *   │                                                        │
 *   │   feedback, oldest → newest (or drill progress)        │  main area, scrolls,
 *   │                                                        │  anchored to the bottom
 *   ├────────────────────────────────────────────────────────┤
 *   │   conversation, last ~2 lines                          │  chat dock
 *   └── mic · chat · end call ───────────────────────────────┘
 *
 * Before the call: the welcome view (start button) and the level picker.
 */
export function TutorLayout({ level, onLevelChange }: TutorLayoutProps) {
  const { isConnected } = useSessionContext();
  const { request, change, isReady } = useLessonMode();
  const ptt = usePushToTalk();

  return (
    <main className="flex h-svh flex-col">
      <header className="z-50 flex flex-wrap items-start justify-between gap-2 p-3 md:p-4">
        <Button size="xs" variant="ghost" onClick={signOut}>
          Log out
        </Button>
        {isConnected && <InputModeSwitch ptt={ptt} />}
        <LevelPicker level={level} onLevelChange={onLevelChange} />
        {isConnected && (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <TodayOverlay />
              <SummaryOverlay />
              <ModePicker request={request} onChange={change} disabled={!isReady} />
            </div>
            <SessionCost />
          </div>
        )}
      </header>

      {!isConnected && (
        <div className="grid flex-1 place-content-center">
          <ViewController />
        </div>
      )}

      {isConnected && (
        <>
          <section className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto px-4">
            <LessonPanels request={request} className="mx-auto max-w-3xl py-2" />
          </section>
          <ChatDock ptt={ptt} className="mx-auto w-full max-w-3xl px-3 pb-3" />
        </>
      )}
    </main>
  );
}
