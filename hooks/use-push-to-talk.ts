'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAgent, useSessionContext } from '@livekit/components-react';
import { InputMode, TutorRpc } from '@/lib/tutor-rpc';

/** How a push-to-talk turn ends. */
export enum TurnEnd {
  Send = 'send', // released: the tutor replies
  Cancel = 'cancel', // interrupted (e.g. window lost focus): drop the turn
}

const HOLD_KEY = ' ';

/**
 * Open mic / push-to-talk state for the tutor session.
 *
 * In push-to-talk mode, holding the space bar (outside text inputs) or the on-screen
 * button opens the agent's mic; releasing sends the turn.
 */
export function usePushToTalk() {
  const session = useSessionContext();
  const agent = useAgent();
  const [mode, setModeState] = useState(InputMode.Open);
  const [isTalking, setIsTalking] = useState(false);
  const talkingRef = useRef(false); // keyboard handlers need the live value

  const rpc = useMemo(
    () => (agent.isConnected ? new TutorRpc(session.room, agent.identity) : null),
    [agent.isConnected, agent.identity, session.room]
  );

  const setMode = useCallback(
    async (next: InputMode) => {
      if (!rpc || next === mode) return;

      try {
        await rpc.setInputMode(next);
        setModeState(next);
      } catch (error) {
        toast.error(`Could not switch input mode: ${String(error)}`);
      }
    },
    [rpc, mode]
  );

  const startTalking = useCallback(() => {
    if (!rpc || mode !== InputMode.PushToTalk || talkingRef.current) return;

    talkingRef.current = true;
    setIsTalking(true);
    rpc.startTurn().catch((error) => toast.error(`Push-to-talk failed: ${String(error)}`));
  }, [rpc, mode]);

  const stopTalking = useCallback(
    (end: TurnEnd) => {
      if (!rpc || !talkingRef.current) return;

      talkingRef.current = false;
      setIsTalking(false);
      const call = end === TurnEnd.Send ? rpc.endTurn() : rpc.cancelTurn();
      call.catch((error) => toast.error(`Push-to-talk failed: ${String(error)}`));
    },
    [rpc]
  );

  // Space bar hold-to-talk. Ignored while typing in the chat input.
  useEffect(() => {
    if (mode !== InputMode.PushToTalk) return;

    const isTyping = (event: KeyboardEvent) =>
      event.target instanceof HTMLElement &&
      (event.target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(event.target.tagName));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== HOLD_KEY || event.repeat || isTyping(event)) return;
      event.preventDefault();
      startTalking();
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== HOLD_KEY || isTyping(event)) return;
      event.preventDefault();
      stopTalking(TurnEnd.Send);
    };
    const onBlur = () => stopTalking(TurnEnd.Cancel);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [mode, startTalking, stopTalking]);

  return { isReady: rpc !== null, mode, setMode, isTalking, startTalking, stopTalking };
}
