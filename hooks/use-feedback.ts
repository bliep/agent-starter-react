'use client';

import { useEffect, useState } from 'react';
import { useSessionContext } from '@livekit/components-react';
import { type FeedbackMessage, subscribeFeedback } from '@/lib/tutor-feedback';

/** Feedback messages for the current session, newest first. Cleared on a new session. */
export function useFeedback(): FeedbackMessage[] {
  const { room, isConnected } = useSessionContext();
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  useEffect(() => {
    if (!isConnected) return;

    setMessages([]);
    return subscribeFeedback(room, (message) => setMessages((prev) => [message, ...prev]));
  }, [room, isConnected]);

  return messages;
}
