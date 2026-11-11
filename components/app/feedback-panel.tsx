'use client';

import { useSessionContext } from '@livekit/components-react';
import { useFeedback } from '@/hooks/use-feedback';
import { cn } from '@/lib/shadcn/utils';
import type { FeedbackMessage } from '@/lib/tutor-feedback';

/**
 * Explicit corrections and new words per learner turn, oldest first, so the newest sits
 * right above the chat. The tutor only recasts out loud; this is where mistakes get named.
 */
export function FeedbackPanel({ className }: { className?: string }) {
  const { isConnected } = useSessionContext();
  const messages = useFeedback(); // newest first
  if (!isConnected) return null;

  // Turns with nothing to say (correct Spanish, no gaps) are counted, not listed.
  const useful = messages
    .filter((m) => m.feedback.corrections.length > 0 || m.feedback.new_vocab.length > 0)
    .reverse();
  const clean = messages.length - useful.length;

  return (
    <aside
      aria-label="Corrections and new words"
      className={cn('flex flex-col gap-3 text-base', className)}
    >
      {useful.length === 0 && (
        <p className="text-muted-foreground">Corrections and new words appear here.</p>
      )}

      <ol className="flex flex-col gap-4">
        {useful.map((message) => (
          <FeedbackItem key={message.turn_id} message={message} />
        ))}
      </ol>

      {clean > 0 && (
        <p className="text-muted-foreground text-xs">
          {clean} correct {clean === 1 ? 'turn' : 'turns'}
        </p>
      )}
    </aside>
  );
}

function FeedbackItem({ message }: { message: FeedbackMessage }) {
  const { corrections, new_vocab, english_gloss } = message.feedback;

  return (
    <li className="flex flex-col gap-1.5 border-b pb-3 last:border-b-0">
      <p className="text-muted-foreground text-sm italic">“{message.learner}”</p>

      {corrections.map((c) => (
        <div key={`${c.original}→${c.corrected}`}>
          <p>
            <span className="text-destructive line-through">{c.original}</span>
            {' → '}
            <span className="font-medium">{c.corrected}</span>
          </p>
          <p className="text-muted-foreground text-sm">{c.rule}</p>
        </div>
      ))}

      {new_vocab.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {new_vocab.map((v) => (
            <li key={v.spanish} className="bg-muted rounded px-2 py-0.5 text-sm">
              <span className="font-medium">{v.spanish}</span> · {v.english}
            </li>
          ))}
        </ul>
      )}

      {corrections.length === 0 && english_gloss && (
        <p className="text-muted-foreground text-sm">{english_gloss}</p>
      )}
    </li>
  );
}
