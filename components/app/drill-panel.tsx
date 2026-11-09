'use client';

import { useDrill } from '@/hooks/use-drill';
import { useWeakWords } from '@/hooks/use-weak-words';
import { cn } from '@/lib/shadcn/utils';
import {
  type DrillEvent,
  LESSON_MODE_LABELS,
  type LessonMode,
  ScoreBand,
  type WeakWord,
  WordError,
  type WordScore,
  scoreBand,
} from '@/lib/tutor-drill';

const BAND_CLASSES: Record<ScoreBand, string> = {
  [ScoreBand.Good]: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  [ScoreBand.Fair]: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  [ScoreBand.Poor]: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

/** Drill progress: current sentence, scored answers (per word), and weakest words. */
export function DrillPanel({ mode, className }: { mode: LessonMode; className?: string }) {
  const { item, results, recap } = useDrill();
  const weakest = useWeakWords(results.length);

  return (
    <aside
      aria-label="Drill"
      className={cn(
        'bg-background/95 flex flex-col gap-3 rounded-lg border p-4 text-sm',
        className
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">{LESSON_MODE_LABELS[mode]}</h2>
        {item && (
          <span className="text-muted-foreground text-xs">
            {item.index + 1} / {item.total}
          </span>
        )}
      </header>

      {!item && !recap && <p className="text-muted-foreground">Preparing sentences…</p>}

      {item && <p className="text-base font-medium">{item.source}</p>}

      {recap && (
        <p className="border-b pb-3">
          Round over: <ScoreChip score={recap.score} /> — say anything for another round.
        </p>
      )}

      <ol className="flex flex-col gap-3 overflow-y-auto">
        {results.map((result) => (
          <ResultItem key={`${result.mode}-${result.index}`} result={result} />
        ))}
      </ol>

      {weakest.length > 0 && <WeakestWords words={weakest} />}
    </aside>
  );
}

function ResultItem({ result }: { result: DrillEvent }) {
  return (
    <li className="flex flex-col gap-1.5 border-b pb-3 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-muted-foreground text-xs">{result.source}</p>
        <ScoreChip score={result.score} />
      </div>
      <p className="text-xs italic">“{result.answer}”</p>
      <WordScores words={result.words} />
      {result.correction && (
        <p className="text-xs">
          Better: <span className="font-medium">{result.correction}</span>
        </p>
      )}
      {scoreBand(result.score) !== ScoreBand.Good &&
        !result.correction &&
        result.expected !== result.source && (
          <p className="text-xs">
            Model answer: <span className="font-medium">{result.expected}</span>
          </p>
        )}
      {result.note && <p className="text-muted-foreground text-xs">{result.note}</p>}
    </li>
  );
}

function WordScores({ words }: { words: WordScore[] }) {
  return (
    <ul className="flex flex-wrap gap-1">
      {words.map((w, i) => (
        <li
          key={`${w.word}-${i}`}
          title={`${Math.round(w.score)}${w.error !== WordError.None ? ` · ${w.error}` : ''}`}
          className={cn(
            'rounded px-1.5 py-0.5 text-xs',
            BAND_CLASSES[scoreBand(w.score)],
            w.error === WordError.Omitted && 'line-through'
          )}
        >
          {w.word}
        </li>
      ))}
    </ul>
  );
}

function WeakestWords({ words }: { words: WeakWord[] }) {
  return (
    <section className="flex flex-col gap-1.5 border-t pt-3">
      <h3 className="text-xs font-semibold">Weakest words</h3>
      <ul className="flex flex-wrap gap-1">
        {words.map((w) => (
          <li
            key={w.word}
            title={`${w.attempts} ${w.attempts === 1 ? 'attempt' : 'attempts'}`}
            className={cn('rounded px-1.5 py-0.5 text-xs', BAND_CLASSES[scoreBand(w.average)])}
          >
            {w.word} · {Math.round(w.average)}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ScoreChip({ score }: { score: number }) {
  return (
    <span
      className={cn('rounded px-1.5 py-0.5 text-xs font-medium', BAND_CLASSES[scoreBand(score)])}
    >
      {Math.round(score)}
    </span>
  );
}
