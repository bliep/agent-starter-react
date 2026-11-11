'use client';

import { useState } from 'react';
import { Overlay } from '@/components/app/overlay';
import { Button } from '@/components/ui/button';
import { useLessonContext } from '@/hooks/use-lesson-context';
import { ERROR_CATEGORY_LABELS, type LessonContext } from '@/lib/tutor-feedback';

/** "Today" button: what this session practises (due words, recent mistakes), as an overlay. */
export function TodayOverlay() {
  const lesson = useLessonContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="sm" variant="outline" disabled={!lesson} onClick={() => setIsOpen(true)}>
        Today
      </Button>
      {isOpen && lesson && (
        <Overlay title="Today" onClose={() => setIsOpen(false)}>
          <LessonView lesson={lesson} />
        </Overlay>
      )}
    </>
  );
}

function LessonView({ lesson }: { lesson: LessonContext }) {
  if (lesson.due_words.length === 0 && lesson.recent_errors.length === 0) {
    return (
      <p className="text-muted-foreground">
        Nothing due yet. Words you miss and mistakes you make show up here next time.
      </p>
    );
  }

  return (
    <>
      {lesson.due_words.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="font-semibold">Words to practise</h3>
          <ul className="flex flex-wrap gap-2">
            {lesson.due_words.map((v) => (
              <li key={v.spanish} className="bg-muted rounded px-2 py-1">
                <span className="font-medium">{v.spanish}</span> · {v.english}
              </li>
            ))}
          </ul>
        </section>
      )}

      {lesson.recent_errors.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="font-semibold">Recent mistakes</h3>
          {lesson.recent_errors.map((e) => (
            <p key={e.category}>
              <span className="font-medium">{ERROR_CATEGORY_LABELS[e.category]}</span>
              <span className="text-muted-foreground">
                {' '}
                ×{e.count} · {e.original} → {e.corrected}
              </span>
            </p>
          ))}
        </section>
      )}
    </>
  );
}
