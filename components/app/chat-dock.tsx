'use client';

import { useState } from 'react';
import {
  type ReceivedMessage,
  useAgent,
  useSessionContext,
  useSessionMessages,
} from '@livekit/components-react';
import {
  AgentChatTranscript,
  AgentMessageActionsContext,
} from '@/components/agents-ui/agent-chat-transcript';
import {
  AgentControlBar,
  type AgentControlBarControls,
} from '@/components/agents-ui/agent-control-bar';
import { LineActions } from '@/components/app/line-actions';
import { HoldToTalkButton, type PushToTalk } from '@/components/app/push-to-talk';
import { cn } from '@/lib/shadcn/utils';

// Slow replay and translation under each tutor line.
// Compact chat: small text, tight bubbles and gaps, so ~5 lines fit.
// No scrollbar: the scroller hides it while auto-scrolling, so it flickered as replies
// streamed in. Scrolling by wheel / touch still works.
const renderLineActions = (message: ReceivedMessage) => <LineActions message={message} />;

// Voice and text only: no camera or screen share in a language lesson.
const CONTROLS: AgentControlBarControls = {
  leave: true,
  microphone: true,
  chat: true,
  camera: false,
  screenShare: false,
};

/**
 * Bottom of the call screen: the conversation transcript (small text), the chat input with
 * mic / end controls, then the hold-to-talk button (push-to-talk mode) at the very bottom.
 */
export function ChatDock({ ptt, className }: { ptt: PushToTalk; className?: string }) {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const { state: agentState } = useAgent();
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <section aria-label="Conversation" className={cn('flex flex-col gap-2', className)}>
      <AgentMessageActionsContext.Provider value={renderLineActions}>
        <AgentChatTranscript
          agentState={agentState}
          messages={messages}
          className="h-40 rounded-lg border **:data-[slot=bubble-content]:py-0.5 **:data-[slot=bubble-content]:leading-snug **:data-[slot=message-scroller-content]:gap-1.5 **:data-[slot=message-scroller-content]:p-2 **:data-[slot=message-scroller-viewport]:[scrollbar-width:none]"
        />
      </AgentMessageActionsContext.Provider>
      <AgentControlBar
        variant="livekit"
        controls={CONTROLS}
        isChatOpen={isChatOpen}
        isConnected={session.isConnected}
        onDisconnect={session.end}
        onIsChatOpenChange={setIsChatOpen}
      />
      <HoldToTalkButton ptt={ptt} className="w-full" />
    </section>
  );
}
