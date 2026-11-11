'use client';

import { useEffect, useState } from 'react';
import { useSessionContext } from '@livekit/components-react';
import { Overlay } from '@/components/app/overlay';
import { Button } from '@/components/ui/button';
import { useSessionSummary } from '@/hooks/use-session-summary';
import type { SessionSummary } from '@/lib/tutor-feedback';

/**
 * "Summary" button that opens the end-of-session summary as an overlay.
 * Each open asks the agent for a fresh summary of the session so far.
 */
export function SummaryOverlay() {
  const { isConnected } = useSessionContext();
  const { summary, isLoading, isReady, request, clear } = useSessionSummary();
  const [isOpen, setIsOpen] = useState(false);

  // A new call starts without the previous call's summary.
  useEffect(() => {
    if (isConnected) return;
    clear();
    setIsOpen(false);
  }, [isConnected, clear]);

  function open() {
    setIsOpen(true);
    request();
  }

  return (
    <>
      <Button size="sm" variant="outline" disabled={!isReady} onClick={open}>
        Summary
      </Button>

      {isOpen && (
        <Overlay title="Session summary" onClose={() => setIsOpen(false)}>
          {isLoading && <p className="text-muted-foreground">Summarising…</p>}
          {!isLoading && summary && <SummaryView summary={summary} />}
        </Overlay>
      )}
    </>
  );
}

function SummaryView({ summary }: { summary: SessionSummary }) {
  return (
    <div className="flex flex-col gap-3 overflow-y-auto">
      <p>{summary.encouragement}</p>

      {summary.patterns.length > 0 && (
        <ol className="flex flex-col gap-3">
          {summary.patterns.map((pattern) => (
            <li key={pattern.title} className="flex flex-col gap-1 border-b pb-3 last:border-b-0">
              <p className="font-medium">{pattern.title}</p>
              <p className="text-muted-foreground text-xs">{pattern.explanation}</p>
              {pattern.examples.map((example) => (
                <p key={example} className="text-xs italic">
                  {example}
                </p>
              ))}
            </li>
          ))}
        </ol>
      )}

      {summary.new_words.length > 0 && (
        <section className="flex flex-col gap-1.5">
          <h3 className="text-xs font-semibold">Words to review</h3>
          <ul className="flex flex-wrap gap-1.5">
            {summary.new_words.map((v) => (
              <li key={v.spanish} className="bg-muted rounded px-1.5 py-0.5 text-xs">
                <span className="font-medium">{v.spanish}</span> · {v.english}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
