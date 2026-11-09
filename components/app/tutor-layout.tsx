'use client';

import type { ReceivedMessage } from '@livekit/components-react';
import { useSessionContext } from '@livekit/components-react';
import { AgentMessageActionsContext } from '@/components/agents-ui/agent-chat-transcript';
import { LessonPanels } from '@/components/app/lesson-workspace';
import { LevelPicker } from '@/components/app/level-picker';
import { LineActions } from '@/components/app/line-actions';
import { ModePicker } from '@/components/app/mode-picker';
import { PushToTalkControls } from '@/components/app/push-to-talk';
import { SessionCost } from '@/components/app/session-cost';
import { ViewController } from '@/components/app/view-controller';
import { Button } from '@/components/ui/button';
import { useLessonMode } from '@/hooks/use-lesson-mode';
import { signOut } from '@/lib/auth';
import type { Level } from '@/lib/tutor-level';

// Slow replay and translation under each tutor line in the transcript.
const renderLineActions = (message: ReceivedMessage) => <LineActions message={message} />;

interface TutorLayoutProps {
  level: Level;
  onLevelChange: (level: Level) => void;
  isVideoInputSupported: boolean;
}

/**
 * The call screen:
 *
 *   ┌ log out ─── input mode / level ─── lesson mode, cost ┐   one bar, wraps on phones
 *   │                transcript + controls                  │   panel: right column (xl)
 *   └────────────────────────────────────────── [Feedback] ─┘   or drawer (phones)
 */
export function TutorLayout({ level, onLevelChange, isVideoInputSupported }: TutorLayoutProps) {
  const { isConnected } = useSessionContext();
  const { request, change, isReady } = useLessonMode();

  return (
    <main className="grid h-svh grid-cols-1 place-content-center">
      <AgentMessageActionsContext.Provider value={renderLineActions}>
        <ViewController isVideoInputSupported={isVideoInputSupported} />
      </AgentMessageActionsContext.Provider>

      <header className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-start justify-between gap-2 p-3 md:p-4">
        <Button size="xs" variant="ghost" onClick={signOut}>
          Log out
        </Button>
        <PushToTalkControls />
        <LevelPicker level={level} onLevelChange={onLevelChange} />
        {isConnected && (
          <div className="flex flex-col items-end gap-1">
            <ModePicker request={request} onChange={change} disabled={!isReady} />
            <SessionCost className="max-md:hidden" />
          </div>
        )}
      </header>

      {isConnected && <LessonPanels request={request} />}
    </main>
  );
}
