'use client';

import { useEffect } from 'react';
import { useSessionContext } from '@livekit/components-react';
import { Button } from '@/components/ui/button';
import { useFeedback } from '@/hooks/use-feedback';
import { useSessionSummary } from '@/hooks/use-session-summary';
import { cn } from '@/lib/shadcn/utils';
import type { FeedbackMessage, SessionSummary } from '@/lib/tutor-feedback';

/**
 * Explicit corrections and new words per learner turn, newest first.
 * The tutor only recasts out loud; this is where mistakes get named.
 */
export function FeedbackPanel({ className }: { className?: string }) {
  const { isConnected } = useSessionContext();
  const messages = useFeedback();
  const { summary, isLoading, isReady, request, clear } = useSessionSummary();

  // A new call starts without the previous call's summary.
  useEffect(() => {
    if (!isConnected) clear();
  }, [isConnected, clear]);

  if (!isConnected) return null;

  // Turns with nothing to say (correct Spanish, no gaps) are counted, not listed.
  const useful = messages.filter(
    (m) => m.feedback.corrections.length > 0 || m.feedback.new_vocab.length > 0
  );
  const clean = messages.length - useful.length;

  return (
    <aside
      aria-label="Corrections and new words"
      className={cn(
        'bg-background/95 flex flex-col gap-3 rounded-lg border p-4 text-sm',
        className
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">{summary ? 'Session summary' : 'Feedback'}</h2>
        {summary ? (
          <Button size="xs" variant="ghost" onClick={clear}>
            Back
          </Button>
        ) : (
          <Button size="xs" variant="outline" disabled={!isReady || isLoading} onClick={request}>
            {isLoading ? 'Summarising…' : 'Summary'}
          </Button>
        )}
      </header>

      {summary && <SummaryView summary={summary} />}

      {!summary && clean > 0 && (
        <p className="text-muted-foreground text-xs">
          {clean} correct {clean === 1 ? 'turn' : 'turns'}
        </p>
      )}

      {!summary && useful.length === 0 && (
        <p className="text-muted-foreground">Corrections and new words appear here.</p>
      )}

      {!summary && (
        <ol className="flex flex-col gap-3 overflow-y-auto">
          {useful.map((message) => (
            <FeedbackItem key={message.turn_id} message={message} />
          ))}
        </ol>
      )}
    </aside>
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

function FeedbackItem({ message }: { message: FeedbackMessage }) {
  const { corrections, new_vocab, english_gloss } = message.feedback;

  return (
    <li className="flex flex-col gap-1.5 border-b pb-3 last:border-b-0">
      <p className="text-muted-foreground text-xs italic">“{message.learner}”</p>

      {corrections.map((c) => (
        <div key={`${c.original}→${c.corrected}`}>
          <p>
            <span className="text-destructive line-through">{c.original}</span>
            {' → '}
            <span className="font-medium">{c.corrected}</span>
          </p>
          <p className="text-muted-foreground text-xs">{c.rule}</p>
        </div>
      ))}

      {new_vocab.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {new_vocab.map((v) => (
            <li key={v.spanish} className="bg-muted rounded px-1.5 py-0.5 text-xs">
              <span className="font-medium">{v.spanish}</span> · {v.english}
            </li>
          ))}
        </ul>
      )}

      {corrections.length === 0 && english_gloss && (
        <p className="text-muted-foreground text-xs">{english_gloss}</p>
      )}
    </li>
  );
}
