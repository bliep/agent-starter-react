import type { Room } from 'livekit-client';

// Text stream topic the agent publishes drill events on (agent/main.py DRILL_TOPIC).
const DRILL_TOPIC = 'tutor.drill';

/** Mirrors agent/modes.py `LessonMode`. */
export enum LessonMode {
  Conversation = 'conversation',
  RolePlay = 'roleplay',
  TranslateToSpanish = 'translate_en',
  TranslateToEnglish = 'translate_es',
  Repeat = 'repeat',
}

export const LESSON_MODE_LABELS: Record<LessonMode, string> = {
  [LessonMode.Conversation]: 'Conversation',
  [LessonMode.RolePlay]: 'Role-play',
  [LessonMode.TranslateToSpanish]: 'EN → ES',
  [LessonMode.TranslateToEnglish]: 'ES → EN',
  [LessonMode.Repeat]: 'Repeat',
};

const DRILL_MODES = new Set([
  LessonMode.TranslateToSpanish,
  LessonMode.TranslateToEnglish,
  LessonMode.Repeat,
]);

export function isDrill(mode: LessonMode): boolean {
  return DRILL_MODES.has(mode);
}

/** Mirrors agent/prompts.py `Scenario`. */
export enum Scenario {
  Restaurant = 'restaurant',
  Doctor = 'doctor',
  JobInterview = 'job_interview',
  Hotel = 'hotel',
  Directions = 'directions',
}

export const SCENARIO_LABELS: Record<Scenario, string> = {
  [Scenario.Restaurant]: 'Tapas bar',
  [Scenario.Doctor]: 'Doctor',
  [Scenario.JobInterview]: 'Job interview',
  [Scenario.Hotel]: 'Hotel',
  [Scenario.Directions]: 'Asking directions',
};

/** Mirrors agent/modes.py `ModeRequest` (set_lesson_mode RPC payload). */
export interface ModeRequest {
  mode: LessonMode;
  scenario: Scenario;
}

/** Mirrors agent/pronunciation.py `WordError`. */
export enum WordError {
  None = 'none',
  Mispronounced = 'mispronounced',
  Omitted = 'omitted',
}

/** Mirrors agent/pronunciation.py `WordScore`. */
export interface WordScore {
  word: string;
  score: number;
  error: WordError;
}

/** Mirrors agent/learner_model.py `WeakWord` (word_scores RPC items). */
export interface WeakWord {
  word: string;
  average: number;
  attempts: number;
}

/** Mirrors agent/drills.py `DrillEventKind`. */
export enum DrillEventKind {
  Item = 'item',
  Result = 'result',
  Recap = 'recap',
}

/** Mirrors agent/drills.py `DrillEvent`. */
export interface DrillEvent {
  kind: DrillEventKind;
  mode: LessonMode;
  index: number;
  total: number;
  prompt: string;
  source: string;
  answer: string;
  expected: string;
  score: number;
  words: WordScore[];
  correction: string;
  note: string;
  weakest: WeakWord[];
}

/** Score bands for colouring (same thresholds as the agent's spoken verdicts). */
export enum ScoreBand {
  Good = 'good',
  Fair = 'fair',
  Poor = 'poor',
}

const GOOD_SCORE = 85;
const FAIR_SCORE = 60;

export function scoreBand(score: number): ScoreBand {
  if (score >= GOOD_SCORE) return ScoreBand.Good;
  if (score >= FAIR_SCORE) return ScoreBand.Fair;
  return ScoreBand.Poor;
}

/** Calls `onEvent` for each drill event; returns an unsubscribe function. */
export function subscribeDrill(room: Room, onEvent: (event: DrillEvent) => void): () => void {
  room.registerTextStreamHandler(DRILL_TOPIC, async (reader) => {
    try {
      onEvent(JSON.parse(await reader.readAll()) as DrillEvent);
    } catch (error) {
      console.warn('Ignoring malformed drill event', error);
    }
  });
  return () => room.unregisterTextStreamHandler(DRILL_TOPIC);
}
