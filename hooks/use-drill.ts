'use client';

import { useEffect, useState } from 'react';
import { useSessionContext } from '@livekit/components-react';
import { type DrillEvent, DrillEventKind, subscribeDrill } from '@/lib/tutor-drill';

export interface DrillState {
  item: DrillEvent | null; // what the learner is answering now
  results: DrillEvent[]; // newest first, current round
  recap: DrillEvent | null; // set when the round is over
}

const EMPTY: DrillState = { item: null, results: [], recap: null };

/** Drill progress from the agent's drill events; a new round clears the old one. */
export function useDrill(): DrillState {
  const { room, isConnected } = useSessionContext();
  const [state, setState] = useState(EMPTY);

  useEffect(() => {
    if (!isConnected) return;

    setState(EMPTY);
    return subscribeDrill(room, (event) =>
      setState((prev) => {
        switch (event.kind) {
          case DrillEventKind.Item: {
            // Item 0 starts a round (also after switching drill type).
            const fresh = event.index === 0 || prev.item?.mode !== event.mode;
            return fresh ? { ...EMPTY, item: event } : { ...prev, item: event };
          }
          case DrillEventKind.Result:
            return { ...prev, results: [event, ...prev.results] };
          case DrillEventKind.Recap:
            return { ...prev, item: null, recap: event };
        }
      })
    );
  }, [room, isConnected]);

  return state;
}
